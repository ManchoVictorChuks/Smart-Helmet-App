export interface User {
  id: string;
  name: string;
  email: string;
  role: "supervisor" | "admin";
}

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: "1",
    name: "John Supervisor",
    email: "supervisor@example.com",
    password: "password123",
    role: "supervisor" as const,
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin" as const,
  },
];

// Local storage keys
const USER_KEY = "safety-app-user";

class AuthService {
  async login(email: string, password: string): Promise<User> {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Store user in local storage
    const userData: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const newUser = {
      id: (MOCK_USERS.length + 1).toString(),
      name,
      email,
      password,
      role: "supervisor" as const,
    };

    // In a real app, this would be saved to a database
    MOCK_USERS.push(newUser);

    // Store user in local storage
    const userData: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  }

  async getCurrentUser(): Promise<User | null> {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) {
      return null;
    }

    return JSON.parse(userJson) as User;
  }

  logout(): void {
    localStorage.removeItem(USER_KEY);
  }
}

export const authService = new AuthService();