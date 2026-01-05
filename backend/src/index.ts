import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors());
app.use(express.json());

// Simple request logger for debugging
app.use((req: Request, _res: Response, next: NextFunction) => {
  // Avoid logging very large bodies
  const bodyString = JSON.stringify(req.body);
  const truncatedBody = bodyString.length > 500 ? bodyString.slice(0, 500) + '...<truncated>' : bodyString;

  console.log('[BACKEND REQUEST]', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: truncatedBody,
    time: new Date().toISOString(),
  });

  next();
});

// In-memory data stores
interface User {
  id: string;
  username: string;
  password: string; // plain text for demo only
  name?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
}

interface Booking {
  id: string;
  userId: string;
  fromAddress: string;
  toAddress: string;
  date: string;
  time: string;
  passengerType?: string;
  equipment?: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

interface PaymentRecord {
  id: string;
  method: string;
  amount: number;
  createdAt: string;
}

const users: User[] = [];
const bookings: Booking[] = [];
const payments: PaymentRecord[] = [];

// Helper to generate simple IDs
const genId = () => Math.random().toString(36).substring(2, 10);

// Auth middleware
interface AuthedRequest extends Request {
  user?: User;
}

const authMiddleware = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = users.find((u) => u.id === payload.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, password, name, phone } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }
  const user: User = {
    id: genId(),
    username,
    password,
    name,
    phone,
  };
  users.push(user);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, username: user.username, name: user.name, phone: user.phone } });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, phone: user.phone } });
});

app.get('/api/auth/me', authMiddleware, (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    phone: user.phone,
    email: user.email,
    birthDate: user.birthDate,
    gender: user.gender,
    address: user.address,
  });
});

// User profile
app.put('/api/users/me', authMiddleware, (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const { name, phone, email, birthDate, gender, address } = req.body;
  Object.assign(user, { name, phone, email, birthDate, gender, address });
  res.json({ message: 'Profile updated', user });
});

// Bookings
app.post('/api/bookings', authMiddleware, (req: AuthedRequest, res: Response) => {
  const { fromAddress, toAddress, date, time, passengerType, equipment } = req.body;
  if (!fromAddress || !toAddress || !date || !time) {
    return res.status(400).json({ message: 'fromAddress, toAddress, date, time are required' });
  }
  const booking: Booking = {
    id: genId(),
    userId: req.user!.id,
    fromAddress,
    toAddress,
    date,
    time,
    passengerType,
    equipment,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  res.status(201).json(booking);
});

app.get('/api/bookings', authMiddleware, (req: AuthedRequest, res: Response) => {
  const statusFilter = req.query.status as string | undefined;
  let result = bookings.filter((b) => b.userId === req.user!.id);
  if (statusFilter && ['upcoming', 'completed', 'cancelled'].includes(statusFilter)) {
    result = result.filter((b) => b.status === statusFilter);
  }
  res.json(result);
});

app.get('/api/bookings/:id', authMiddleware, (req: AuthedRequest, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id && b.userId === req.user!.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
});

app.put('/api/bookings/:id', authMiddleware, (req: AuthedRequest, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id && b.userId === req.user!.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const { fromAddress, toAddress, date, time, passengerType, equipment, status } = req.body;
  if (status && !['upcoming', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  Object.assign(booking, { fromAddress, toAddress, date, time, passengerType, equipment, status });
  res.json(booking);
});

app.delete('/api/bookings/:id', authMiddleware, (req: AuthedRequest, res: Response) => {
  const index = bookings.findIndex((b) => b.id === req.params.id && b.userId === req.user!.id);
  if (index === -1) return res.status(404).json({ message: 'Booking not found' });
  bookings.splice(index, 1);
  res.status(204).send();
});

// Payments (no auth for demo)
app.post('/api/payments', (req: Request, res: Response) => {
  const { method, amount } = req.body as { method?: string; amount?: number };
  if (!method) {
    return res.status(400).json({ message: 'method is required' });
  }
  const record: PaymentRecord = {
    id: genId(),
    method,
    amount: typeof amount === 'number' ? amount : 0,
    createdAt: new Date().toISOString(),
  };
  payments.push(record);
  res.status(201).json(record);
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'SAFEPath demo backend running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
