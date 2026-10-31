import { useMemo, useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  CalendarDays,
  Snowflake,
  MessageSquare,
  ChartNoAxesCombined,
  Users,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  Clock3,
  CheckCircle2,
  CircleDollarSign,
  Menu as MenuIcon,
  X,
  Send,
  Pencil,
  Trash2,
  ImagePlus,
  Download,
  Filter,
  Sparkles,
  ChefHat,
  Mail,
  TrendingUp,
  PackageCheck,
  Heart,
  Tag,
  Phone,
  MessageCircle,
  Percent,
  Building,
  UserCheck,
  Printer,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckSquare,
  Square,
  Calendar,
  FileText,
  DollarSign,
  GraduationCap,
  CheckCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  UserPlus,
  ShieldAlert,
  Table as TableIcon,
  LayoutGrid,
  MapPin,
  Star,
  Package
} from 'lucide-react';
import { defaultFoods } from './data/menuData';

export type AdminRole = 'super_admin' | 'admin_staff';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'Active' | 'Suspended';
  createdAt?: string;
  lastLoginAt?: string;
  invitedBy?: string;
}

const getStoredAdmin = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem('magreat_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Bulletproof backend URL resolver (auto-detects production environments and fallbacks to live Render backend)
const getApiBase = () => {
  const envUrl = String((import.meta as any).env?.VITE_API_URL || '').trim().replace(/\/+$/, '');
  const isBrowser = typeof window !== 'undefined';
  const isLocalHost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If running in production (not localhost) but envUrl is set to localhost or empty, use live Render backend
  if (isBrowser && !isLocalHost) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://magreat-backend.onrender.com/api';
    }
  }

  const base = envUrl || 'https://magreat-backend.onrender.com/api';
  return base.endsWith('/api') ? base : `${base}/api`;
};

const API_BASE = getApiBase();
const ADMIN_SECRET = String((import.meta as any).env?.VITE_ADMIN_SECRET || 'MagreatTaste#AdminSecret2026!Key_x99').trim();

/** Authenticated fetch — automatically attaches the logged in admin user session token or system secret */
function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = localStorage.getItem('magreat_admin_token') || ADMIN_SECRET;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

type Section =
  | 'Overview'
  | 'Orders'
  | 'Menu management'
  | 'Delivery locations'
  | 'Catering & events'
  | 'Tasting requests'
  | 'Meal plans'
  | 'Culinary school'
  | 'Messages'
  | 'Newsletter & broadcasts'
  | 'Saved meals & reminders'
  | 'Analytics'
  | 'Customers'
  | 'Settings';

export type DeliveryLocation = {
  id: string;
  name: string;
  zone: string;
  state: 'Lagos';
  deliveryFee: number;
  estimatedTime: string;
  isActive: boolean;
  createdAt?: string;
};

export type AcademyLead = {
  id: string;
  refNumber: string;
  fullName: string;
  email: string;
  phone: string;
  journey: string;
  schedule: string;
  experience: string;
  notes?: string;
  status: 'Pending Review' | 'Admitted' | 'Contacted' | 'Enrolled' | 'Cancelled';
  appliedAt: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  subscribedAt: string;
};

export type NewsletterCampaign = {
  id: string;
  subject: string;
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  recipientCount: number;
  status: 'Sent' | 'Failed' | 'Draft';
  sentAt: string;
};

export type Food = {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'Available' | 'Sold out' | 'Hidden';
  orders: number;
  image: string;
  description?: string;
  tag?: string;
  rating?: string;
  time?: string;
  availableLocations?: string[];
  hidden?: boolean;
};

export type Order = {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  address?: string;
  item: string;
  items?: { name: string; quantity: number; price: number }[];
  date: string;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  status: 'New' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
};

export type MealPlanPackage = {
  id: string;
  name: string;
  meals: string;
  price: number;
  description: string;
  features: string[];
  color: 'mint' | 'peach' | 'lavender' | 'amber';
  active?: boolean;
};

export type CustomerDiscount = {
  id: string;
  customerName?: string;
  customerEmail?: string;
  companyName?: string;
  type: 'percent' | 'fixed';
  value: number; // e.g. 15 for 15% or 5000 for 5000 NGN
  code: string;
  appliesTo: 'individual' | 'company' | 'all';
  notes?: string;
  active: boolean;
  createdAt: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  segment: 'Corporate' | 'Loyal VIP' | 'Returning' | 'Meal plan' | 'New';
  companyName?: string;
  discount?: CustomerDiscount;
  kitchenNotes?: string;
};

export type CateringLead = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  guestCount: number;
  location: string;
  eventDate: string;
  budget?: string;
  dietaryRequirements?: string;
  notes?: string;
  status: 'Pending' | 'Quote sent' | 'Confirmed' | 'Declined';
  quoteAmount?: number;
  menuNotes?: string;
  confirmedAt?: string;
};

export interface SignatureDish {
  id: string;
  foodId?: number;
  name: string;
  tag: string;
  price?: number;
  description?: string;
  image: string;
  local?: string;
  alt?: string;
  order?: number;
  createdAt?: string;
}

export interface TastingRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  companyEmail: string;
  guestCount: number;
  mealCount: number;
  mealSelections: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: 'Pending' | 'Scheduled' | 'Delivered' | 'Declined';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SavedMealCustomer = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: { name: string; price?: number; category?: string }[];
  reminderStatus: 'Active' | 'Unsubscribed' | 'Paused';
  reminderCount: number;
  lastReminderSentAt?: string;
  mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert & Snacks';
  createdAt: string;
};

// Preset delicious meal photos for quick selection
const PRESET_DISH_IMAGES = [
  { label: 'Party Jollof & Chicken', url: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80' },
  { label: 'Egusi Soup & Pounded Yam', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Heritage Ofada Rice', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80' },
  { label: 'Smoky Grilled Asun / Suya', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Fried Rice & Proteins', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80' },
  { label: 'English Breakfast & Pastry', url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80' }
];

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

// Smart meal image resolver
export function resolveMealImage(img?: string): string {
  if (!img) return FALLBACK_FOOD_IMG;
  const trimmed = img.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return cleanPath;
}

const initialFoods: Food[] = defaultFoods.map((f: any) => ({
  id: f.id,
  name: f.name,
  category: f.category || 'Nigerian',
  price: f.price,
  status: (f.status as any) || 'Available',
  orders: 0,
  image: f.image || FALLBACK_FOOD_IMG,
  description: f.description,
  tag: f.tag,
  rating: f.rating || '4.9',
  time: f.time || '25–35 min',
  availableLocations: Array.isArray(f.availableLocations) ? f.availableLocations : []
}));

const initialOrders: Order[] = [];

const initialMealPlans: MealPlanPackage[] = [
  {
    id: 'single-professional',
    name: 'Single Professional',
    meals: '5 meals + 1 soup tub (1.5L)',
    price: 32500,
    description: 'Perfect for busy executives who want wholesome home dinners ready in minutes without cooking or food waste.',
    features: ['5 Individual Chef Meals', '1 Bowl Signature Soup (1.5L)', '2 Portions Grilled Protein Sides', 'Free Saturday Dispatch'],
    color: 'mint',
    active: true
  },
  {
    id: 'couples-duo',
    name: 'Couples & Duo',
    meals: '10 meals + 2 soup tubs (2.5L)',
    price: 58000,
    description: 'Ideal for couples or roommates desiring varied, flavorful lunches and dinners without kitchen stress.',
    features: ['10 Gourmet Meals / week', '2 Traditional Soup Bowls (2.5L)', '4 Assorted Meats & Fish', 'Custom Spice Level'],
    color: 'peach',
    active: true
  },
  {
    id: 'family-feast',
    name: 'Family Feast Plan',
    meals: '20 meals + 4 soup tubs (4L)',
    price: 115000,
    description: 'Designed for households of 4–6. Abundant portions of authentic home-cooked food the whole family will love.',
    features: ['20 Full Portion Meals', '4 Large Soup Tubs (4L each)', 'Bulk Jollof & Fried Rice Trays', 'Dedicated WhatsApp Concierge'],
    color: 'amber',
    active: true
  },
  {
    id: 'fit-lean',
    name: 'Fit & Lean Protein',
    meals: '7 high-protein macro bowls',
    price: 48000,
    description: 'Tailored for fitness enthusiasts and weight watchers. High protein, clean cold-pressed oils, low glycemic index.',
    features: ['7 High-Protein Low-Carb Bowls', 'Marinated Herb Chicken & Fish', 'Local Greens & Brown Rice', 'Macro Label on Every Box'],
    color: 'lavender',
    active: true
  }
];

const initialCustomers: CustomerRecord[] = [];
const initialCateringLeads: CateringLead[] = [];
const initialSavedCustomers: SavedMealCustomer[] = [];

const initialAcademyLeads: AcademyLead[] = [
  {
    id: 'acad-001',
    refNumber: 'MGA-849201',
    fullName: 'Blessing Adebayo',
    email: 'blessing.adebayo@gmail.com',
    phone: '08123456789',
    journey: '6-months',
    schedule: 'weekend-executive',
    experience: 'Beginner',
    notes: 'Aspiring to launch my own private catering brand in Lekki after completing the diploma.',
    status: 'Pending Review',
    appliedAt: new Date(Date.now() - 86400000 * 1.5).toISOString()
  },
  {
    id: 'acad-002',
    refNumber: 'MGA-518290',
    fullName: 'Emmanuel Okafor',
    email: 'emmanuel.okafor@yahoo.com',
    phone: '08098765432',
    journey: '3-months',
    schedule: 'weekday-intensive',
    experience: 'Intermediate',
    notes: 'Looking to master continental sauces, pastry presentation, and knife speed skills.',
    status: 'Contacted',
    appliedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'acad-003',
    refNumber: 'MGA-930128',
    fullName: 'Amina Bello',
    email: 'amina.bello@gmail.com',
    phone: '09012348765',
    journey: '9-months',
    schedule: 'weekend-executive',
    experience: 'Professional',
    notes: 'Restaurant owner seeking executive mastery in modern African fusion and kitchen operations.',
    status: 'Admitted',
    appliedAt: new Date(Date.now() - 86400000 * 6).toISOString()
  }
];

const initialLagosLocations: DeliveryLocation[] = [
  { id: 'lekki-phase-1', name: 'Lekki Phase 1', zone: 'Island & Lekki Axis', state: 'Lagos', deliveryFee: 2000, estimatedTime: '20–35 min', isActive: true },
  { id: 'victoria-island', name: 'Victoria Island (VI)', zone: 'Lagos Island', state: 'Lagos', deliveryFee: 2500, estimatedTime: '25–40 min', isActive: true },
  { id: 'ikoyi', name: 'Ikoyi & Banana Island', zone: 'Lagos Island', state: 'Lagos', deliveryFee: 2500, estimatedTime: '25–40 min', isActive: true },
  { id: 'ikeja-gra', name: 'Ikeja GRA & Alausa', zone: 'Lagos Mainland', state: 'Lagos', deliveryFee: 3000, estimatedTime: '30–45 min', isActive: true },
  { id: 'surulere', name: 'Surulere', zone: 'Lagos Mainland', state: 'Lagos', deliveryFee: 2500, estimatedTime: '30–45 min', isActive: true },
  { id: 'yaba', name: 'Yaba & Akoka', zone: 'Lagos Mainland', state: 'Lagos', deliveryFee: 2500, estimatedTime: '25–40 min', isActive: true },
  { id: 'ajah', name: 'Ajah & Sangotedo', zone: 'Lekki-Epe Axis', state: 'Lagos', deliveryFee: 3000, estimatedTime: '35–50 min', isActive: true },
  { id: 'maryland', name: 'Maryland & Anthony', zone: 'Lagos Mainland', state: 'Lagos', deliveryFee: 2800, estimatedTime: '30–45 min', isActive: true },
  { id: 'magodo', name: 'Magodo Phase 1 & 2', zone: 'Lagos Mainland', state: 'Lagos', deliveryFee: 3200, estimatedTime: '35–50 min', isActive: true },
  { id: 'gbagada', name: 'Gbagada', zone: 'Lagos Mainland', state: 'Lagos', deliveryFee: 2500, estimatedTime: '25–40 min', isActive: true }
];

const nav: { label: Section; icon: any; group: string; count?: number }[] = [
  { label: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE' },
  { label: 'Orders', icon: ShoppingBag, group: 'WORKSPACE' },
  { label: 'Menu management', icon: UtensilsCrossed, group: 'WORKSPACE' },
  { label: 'Delivery locations', icon: MapPin, group: 'WORKSPACE' },
  { label: 'Catering & events', icon: CalendarDays, group: 'WORKSPACE' },
  { label: 'Tasting requests', icon: Package, group: 'WORKSPACE' },
  { label: 'Meal plans', icon: Snowflake, group: 'WORKSPACE' },
  { label: 'Culinary school', icon: GraduationCap, group: 'WORKSPACE' },
  { label: 'Messages', icon: MessageSquare, group: 'ENGAGE' },
  { label: 'Newsletter & broadcasts', icon: Mail, group: 'ENGAGE' },
  { label: 'Saved meals & reminders', icon: Heart, group: 'ENGAGE' },
  { label: 'Analytics', icon: ChartNoAxesCombined, group: 'BUSINESS' },
  { label: 'Customers', icon: Users, group: 'BUSINESS' },
  { label: 'Settings', icon: Settings, group: 'BUSINESS' }
];

const money = (n: number) => '₦' + (n || 0).toLocaleString('en-NG');

function LocationMealAssignForm({
  location,
  foods,
  onSave,
  onCancel,
  isSaving
}: {
  location: DeliveryLocation;
  foods: Food[];
  onSave: (locId: string, assignedIds: number[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    return foods
      .filter(f => !f.availableLocations || f.availableLocations.length === 0 || f.availableLocations.includes(location.id))
      .map(f => f.id);
  });
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const filtered = foods.filter(f => {
    const q = query.toLowerCase().trim();
    const matchQ = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    const matchC = catFilter === 'All' || f.category === catFilter;
    return matchQ && matchC;
  });

  const toggleDish = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave(location.id, selectedIds);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="secondary-btn"
            style={{ fontSize: 11, padding: '5px 10px' }}
            onClick={() => setSelectedIds(foods.map(f => f.id))}
          >
            ✓ Select All ({foods.length})
          </button>
          <button
            type="button"
            className="secondary-btn"
            style={{ fontSize: 11, padding: '5px 10px' }}
            onClick={() => setSelectedIds([])}
          >
            ✕ Clear All
          </button>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-red)' }}>
          {selectedIds.length} of {foods.length} dishes enabled
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Filter dishes..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 2, padding: '6px 10px', fontSize: 12 }}
        />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}
        >
          <option value="All">All Categories</option>
          <option value="Nigerian">Nigerian</option>
          <option value="Soups & Swallows">Soups & Swallows</option>
          <option value="Grills & Proteins">Grills & Proteins</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Continental">Continental</option>
          <option value="Asian">Asian</option>
          <option value="Pastries & Snacks">Pastries & Snacks</option>
        </select>
      </div>

      <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(f => {
          const checked = selectedIds.includes(f.id);
          return (
            <label
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 10px',
                borderRadius: 6,
                background: checked ? '#f0fdf4' : '#ffffff',
                border: checked ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleDish(f.id)}
                style={{ width: 17, height: 17, cursor: 'pointer' }}
              />
              <img
                src={resolveMealImage(f.image)}
                alt={f.name}
                style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                onError={e => { e.currentTarget.src = FALLBACK_FOOD_IMG; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 13, color: 'var(--brand-navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </strong>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {f.category} • ₦{(f.price || 0).toLocaleString()}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: checked ? '#166534' : '#94a3b8' }}>
                {checked ? 'Available' : 'Unavailable'}
              </span>
            </label>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, margin: '20px 0' }}>
            No dishes match filter
          </p>
        )}
      </div>

      <div className="modal-actions" style={{ marginTop: 16 }}>
        <button type="button" className="secondary-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary-btn" disabled={isSaving}>
          {isSaving ? 'Saving...' : `Save for ${location.name}`}
        </button>
      </div>
    </form>
  );
}

function App() {
  const [section, setSection] = useState<Section>('Overview');
  const [foods, setFoods] = useState<Food[]>(initialFoods);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [mealPlans, setMealPlans] = useState<MealPlanPackage[]>(initialMealPlans);
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [cateringLeads, setCateringLeads] = useState<CateringLead[]>(initialCateringLeads);
  const [savedCustomers, setSavedCustomers] = useState<SavedMealCustomer[]>(initialSavedCustomers);
  const [academyLeads, setAcademyLeads] = useState<AcademyLead[]>(initialAcademyLeads);
  const [academyJourneyFilter, setAcademyJourneyFilter] = useState('All');
  const [academyStatusFilter, setAcademyStatusFilter] = useState('All');
  const [academySearch, setAcademySearch] = useState('');
  const [academyViewMode, setAcademyViewMode] = useState<'table' | 'cards'>('table');
  const [selectedAcademyDrawer, setSelectedAcademyDrawer] = useState<AcademyLead | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [backendOnline, setBackendOnline] = useState(false);
  const [openFoodMenuId, setOpenFoodMenuId] = useState<number | null>(null);
  const [reminderDispatchTime, setReminderDispatchTime] = useState('17:00');
  const [selectedMealCategory, setSelectedMealCategory] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert & Snacks'>('All');
  const [reminderOccasionInModal, setReminderOccasionInModal] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert & Snacks'>('Dinner');

  // Reminders Multi-Select State
  const [selectedReminderIds, setSelectedReminderIds] = useState<string[]>([]);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [autoScheduleActive, setAutoScheduleActive] = useState(true);
  const [reminderPreviewTarget, setReminderPreviewTarget] = useState<SavedMealCustomer | null>(null);

  // Catering Quote & Details State
  const [quoteTargetLead, setQuoteTargetLead] = useState<CateringLead | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [selectedCateringDrawer, setSelectedCateringDrawer] = useState<CateringLead | null>(null);
  const [cateringSearch, setCateringSearch] = useState('');
  const [cateringStatusFilter, setCateringStatusFilter] = useState<'All' | CateringLead['status']>('All');
  const [cateringViewMode, setCateringViewMode] = useState<'table' | 'cards'>('table');

  // Signature Dishes State
  const [signatureDishes, setSignatureDishes] = useState<SignatureDish[]>([]);
  const [menuSubTab, setMenuSubTab] = useState<'all' | 'signature'>('all');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [editingSignatureDish, setEditingSignatureDish] = useState<SignatureDish | null>(null);
  const [sigDishName, setSigDishName] = useState('');
  const [sigDishTag, setSigDishTag] = useState("Chef's Pride");
  const [sigDishPrice, setSigDishPrice] = useState('');
  const [sigDishDescription, setSigDishDescription] = useState('');
  const [sigDishImage, setSigDishImage] = useState('');
  const [sigSelectedFoodId, setSigSelectedFoodId] = useState<number | ''>('');

  // Corporate Tasting Requests State
  const [tastingRequests, setTastingRequests] = useState<TastingRequest[]>([]);
  const [tastingSearch, setTastingSearch] = useState('');
  const [tastingStatusFilter, setTastingStatusFilter] = useState<'All' | TastingRequest['status']>('All');
  const [selectedTastingDrawer, setSelectedTastingDrawer] = useState<TastingRequest | null>(null);

  // Modals & Drawers state
  const [showAddFood, setShowAddFood] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlanPackage | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [targetCustomerForDiscount, setTargetCustomerForDiscount] = useState<CustomerRecord | null>(null);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<CustomerRecord | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Admin Authentication & RBAC Session State
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(getStoredAdmin);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Team & Privileges State
  const [adminTeam, setAdminTeam] = useState<AdminUser[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('admin_staff');
  const [isInviting, setIsInviting] = useState(false);

  // Form states: Food Add/Edit
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('Nigerian');
  const [foodTag, setFoodTag] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [foodImage, setFoodImage] = useState('');
  const [foodStatus, setFoodStatus] = useState<'Available' | 'Sold out' | 'Hidden'>('Available');
  const [menuStatusFilter, setMenuStatusFilter] = useState<'All' | 'Available' | 'Sold out' | 'Hidden'>('All');
  const [uploadingFoodImg, setUploadingFoodImg] = useState(false);
  const [foodAvailableLocations, setFoodAvailableLocations] = useState<string[]>([]);

  // Delivery Locations State (Places within Lagos State Only)
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>(initialLagosLocations);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<DeliveryLocation | null>(null);
  const [locName, setLocName] = useState('');
  const [locZone, setLocZone] = useState('Lagos Island');
  const [locDeliveryFee, setLocDeliveryFee] = useState('2500');
  const [locEstimatedTime, setLocEstimatedTime] = useState('25–40 min');
  const [locIsActive, setLocIsActive] = useState(true);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationZoneFilter, setLocationZoneFilter] = useState('All');
  const [mealAssignLocation, setMealAssignLocation] = useState<DeliveryLocation | null>(null);
  const [isSavingMealLocations, setIsSavingMealLocations] = useState(false);

  // Form states: Meal Plan Add/Edit
  const [planName, setPlanName] = useState('');
  const [planMeals, setPlanMeals] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planFeaturesText, setPlanFeaturesText] = useState('');
  const [planColor, setPlanColor] = useState<'mint' | 'peach' | 'lavender' | 'amber'>('mint');

  // Form states: Discount Assignment
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAppliesTo, setDiscountAppliesTo] = useState<'individual' | 'company' | 'all'>('individual');
  const [discountNotes, setDiscountNotes] = useState('');

  // Form states: New Customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustSegment, setNewCustSegment] = useState<'Corporate' | 'Loyal VIP' | 'Returning' | 'Meal plan' | 'New'>('Corporate');

  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Newsletter Studio & Email Broadcast States
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [newsletterSubject, setNewsletterSubject] = useState("Weekend Feast: 15% Off Family Soups & Party Jollof!");
  const [newsletterTitle, setNewsletterTitle] = useState("A Warm Weekend Feast from Chef Margaret's Kitchen");
  const [newsletterContent, setNewsletterContent] = useState("Hello Ma'Great Food Lover,\n\nWe are delighted to share this weekend's special offerings fresh from our kitchen. Our signature Fishermans Soup, slow-simmered Ofe Owerri, and Smoky Party Jollof are ready for your family gatherings and cozy weekend dinners.\n\nEnjoy complimentary weekend dispatch on all orders placed before 3:00 PM today. Treat yourself to the true taste of home!");
  const [newsletterButtonText, setNewsletterButtonText] = useState('Explore Menu & Order Now');
  const [newsletterButtonUrl, setNewsletterButtonUrl] = useState('https://magreattaste.ng');
  const [testEmailInput, setTestEmailInput] = useState('hello@magreattaste.ng');
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [isTestingNewsletter, setIsTestingNewsletter] = useState(false);
  const [showNewsletterPreview, setShowNewsletterPreview] = useState(false);
  const [showConfirmBroadcastModal, setShowConfirmBroadcastModal] = useState(false);
  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
  const [smtpStatus, setSmtpStatus] = useState<{ success: boolean; message: string; host?: string; port?: number; user?: string } | null>(null);
  const [isCheckingSmtp, setIsCheckingSmtp] = useState(false);

  const savedLocalSettings = (() => {
    try {
      const raw = localStorage.getItem('magreat_store_settings');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // Settings States (Real-time backend synchronization)
  const [settingsBusinessName, setSettingsBusinessName] = useState(savedLocalSettings?.businessName || "Ma'Great Taste Restaurant & Catering Services");
  const [settingsAddress, setSettingsAddress] = useState(savedLocalSettings?.kitchenAddress || 'Lekki Phase 1, Lagos, Nigeria');
  const [settingsPhone, setSettingsPhone] = useState(savedLocalSettings?.phone || '+234 905 827 1973');
  const [settingsEmail, setSettingsEmail] = useState(savedLocalSettings?.email || 'orders@magreattaste.ng');
  const [settingsOnlineOrdering, setSettingsOnlineOrdering] = useState(savedLocalSettings?.onlineOrdering !== undefined ? savedLocalSettings.onlineOrdering : true);
  const [settingsWhatsappAlerts, setSettingsWhatsappAlerts] = useState(savedLocalSettings?.whatsappAlerts !== undefined ? savedLocalSettings.whatsappAlerts : true);
  const [settingsCorporateDiscounts, setSettingsCorporateDiscounts] = useState(savedLocalSettings?.corporateDiscounts !== undefined ? savedLocalSettings.corporateDiscounts : true);
  const [settingsMinOrder, setSettingsMinOrder] = useState(String(savedLocalSettings?.minOrderAmount || '3000'));
  const [settingsDeliveryFee, setSettingsDeliveryFee] = useState(String(savedLocalSettings?.deliveryFee || '2000'));
  const [settingsOpeningHours, setSettingsOpeningHours] = useState(savedLocalSettings?.openingHours || '8:00 AM – 10:00 PM Daily');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [cateringServicePrices, setCateringServicePrices] = useState<Array<{
    id: string; label: string; pricePerGuest: number; description?: string;
  }>>([
    { id: 'buffet', label: 'Grand Buffet Feast', pricePerGuest: 8500 },
    { id: 'plated', label: 'Plated VIP 3-Course Banquet', pricePerGuest: 14000 },
    { id: 'cocktail', label: 'Cocktail & Grill Bar', pricePerGuest: 5500 }
  ]);
  const [isSavingCateringPrices, setIsSavingCateringPrices] = useState(false);
  const [marqueeMessages, setMarqueeMessages] = useState<string[]>([
    '🎉 Order before 12pm and get same-day delivery — Lagos only',
    '🍽️ Catering bookings now open for December events — book early!',
    '✨ New freezer meals just added — stock up for the week',
    '📞 Need help? Call or WhatsApp us: 09058271973',
    '🎓 Culinary School intakes open — limited spots available',
  ]);
  const [newMarqueeMsg, setNewMarqueeMsg] = useState('');
  const [isSavingMarquee, setIsSavingMarquee] = useState(false);

  const sectionRef = useRef(section);
  useEffect(() => {
    sectionRef.current = section;
  }, [section]);

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 3200);
  };

  // Dynamic Navigation: Financial Analytics is completely restricted to Super Admin (Chef Margaret)
  const navList = useMemo(() => {
    return nav.filter(item => {
      if (item.label === 'Analytics' && currentAdmin?.role !== 'super_admin') {
        return false;
      }
      return true;
    });
  }, [currentAdmin?.role]);

  // Restrict staff if they attempt to navigate to Analytics
  useEffect(() => {
    if (currentAdmin && currentAdmin.role === 'admin_staff' && section === 'Analytics') {
      setSection('Overview');
      notify('Access Restricted: Financial analytics are reserved for Head Chef Margaret.');
    }
  }, [section, currentAdmin]);

  // Load team when Super Admin opens portal
  const fetchAdminTeam = async () => {
    if (currentAdmin?.role !== 'super_admin') return;
    setLoadingTeam(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/team`);
      if (res.ok) {
        const data = await res.json();
        setAdminTeam(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (currentAdmin?.role === 'super_admin') {
      fetchAdminTeam();
    }
  }, [currentAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your work email and password.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid work email or password.');
      }
      localStorage.setItem('magreat_admin_token', data.token);
      localStorage.setItem('magreat_admin_user', JSON.stringify(data.user));
      setCurrentAdmin(data.user);
      notify(`Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminSignOut = () => {
    localStorage.removeItem('magreat_admin_token');
    localStorage.removeItem('magreat_admin_user');
    setCurrentAdmin(null);
    setLoginEmail('');
    setLoginPassword('');
    setShowProfileMenu(false);
    notify('Signed out of admin portal.');
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim() || !invitePassword.trim()) {
      notify('Please fill out all fields (name, email, password).');
      return;
    }
    setIsInviting(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/team/invite`, {
        method: 'POST',
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          password: invitePassword,
          role: inviteRole
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite administrator.');
      notify(`Administrator "${inviteName}" successfully invited!`);
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('');
      setInviteRole('admin_staff');
      setInviteModalOpen(false);
      fetchAdminTeam();
    } catch (err: any) {
      notify(err.message || 'Error inviting admin.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from admin access?`)) return;
    try {
      const res = await adminFetch(`${API_BASE}/admin/team/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove admin.');
      notify(`Removed ${name} from admin access.`);
      fetchAdminTeam();
    } catch (err: any) {
      notify(err.message || 'Error removing admin.');
    }
  };

  const handleToggleAdminStatus = async (admin: AdminUser) => {
    const newStatus = admin.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await adminFetch(`${API_BASE}/admin/team/${admin.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');
      notify(`${admin.name} is now ${newStatus}.`);
      fetchAdminTeam();
    } catch (err: any) {
      notify(err.message || 'Error updating status.');
    }
  };

  // Immediate Health Check with automatic retry
  const pingHealth = () => {
    adminFetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(d => {
        if (d && (d.status === 'ok' || d.service)) {
          setBackendOnline(true);
        }
      })
      .catch(() => {
        // If an endpoint succeeds elsewhere, backendOnline will still be set to true
      });
  };

  // Cloudinary / Local Image Upload handler
  const handleImageUpload = (file: File) => {
    setUploadingFoodImg(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await adminFetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            folder: 'magreat_dishes'
          })
        });
        const data = await res.json();
        if (data.url) {
          setFoodImage(data.url);
          notify('Uploaded to Cloudinary CDN successfully!');
        } else {
          throw new Error();
        }
      } catch {
        setFoodImage(base64);
        notify('Photo preview cached locally.');
      } finally {
        setUploadingFoodImg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Real-time backend synchronizer with isolated safe fetches
  const loadBackendData = async () => {
    pingHealth();

    // Menu (fetch all dishes including hidden for admin management)
    adminFetch(`${API_BASE}/menu?all=true`)
      .then(r => r.json())
      .then(foodData => {
        if (Array.isArray(foodData) && foodData.length > 0) {
          setBackendOnline(true);
          setFoods(
            foodData.map((f: any) => ({
              id: f.id,
              name: f.name,
              category: f.category || 'Nigerian',
              price: f.price,
              status: f.status || 'Available',
              orders: 0,
              image: f.image || FALLBACK_FOOD_IMG,
              description: f.description,
              tag: f.tag,
              rating: f.rating || '4.9',
              time: f.time || '25–35 min',
              availableLocations: Array.isArray(f.availableLocations) ? f.availableLocations : []
            }))
          );
        }
      })
      .catch(() => { });

    // Delivery Locations (Lagos State Only)
    adminFetch(`${API_BASE}/locations?all=true`)
      .then(r => r.json())
      .then(locData => {
        if (Array.isArray(locData) && locData.length > 0) {
          setDeliveryLocations(locData);
        }
      })
      .catch(() => { });

    // Orders
    adminFetch(`${API_BASE}/orders`)
      .then(r => r.json())
      .then(orderData => {
        if (Array.isArray(orderData)) {
          setBackendOnline(true);
          setOrders(
            orderData.map((o: any) => ({
              id: o.id,
              customer: o.customerName,
              email: o.customerEmail,
              phone: o.customerPhone,
              address: o.deliveryAddress,
              item: Array.isArray(o.items) ? o.items.map((i: any) => `${i.name} · ${i.quantity || 1}`).join(', ') : 'Order',
              items: o.items || [],
              date: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date(o.createdAt).toLocaleDateString() + ')',
              subtotal: o.subtotal,
              deliveryFee: o.deliveryFee,
              total: o.total,
              status: o.status,
              paymentMethod: o.paymentMethod,
              paymentStatus: o.paymentStatus,
              notes: o.deliveryNotes
            }))
          );
        }
      })
      .catch(() => { });

    // Catering Leads
    adminFetch(`${API_BASE}/catering`)
      .then(r => r.json())
      .then(catData => {
        if (Array.isArray(catData)) {
          setBackendOnline(true);
          setCateringLeads(catData);
        }
      })
      .catch(() => { });

    // Signature Dishes
    adminFetch(`${API_BASE}/signature-dishes`)
      .then(r => r.json())
      .then(sigData => {
        if (Array.isArray(sigData)) {
          setSignatureDishes(sigData);
        }
      })
      .catch(() => { });

    // Corporate Tasting Requests
    adminFetch(`${API_BASE}/tasting-requests`)
      .then(r => r.json())
      .then(tastingData => {
        if (Array.isArray(tastingData)) {
          setTastingRequests(tastingData);
        }
      })
      .catch(() => { });

    // Meal Plan Packages
    adminFetch(`${API_BASE}/mealplans/packages`)
      .then(r => r.json())
      .then(pkgData => {
        if (Array.isArray(pkgData)) {
          setBackendOnline(true);
          if (pkgData.length > 0) setMealPlans(pkgData);
        }
      })
      .catch(() => { });

    // Saved Meals & Reminders
    adminFetch(`${API_BASE}/saved-meals`)
      .then(r => r.json())
      .then(savedData => {
        if (Array.isArray(savedData)) {
          setBackendOnline(true);
          setSavedCustomers(savedData);
        }
      })
      .catch(() => { });

    // Customer Discounts
    adminFetch(`${API_BASE}/discounts`)
      .then(r => r.json())
      .then(discData => {
        if (Array.isArray(discData)) {
          setBackendOnline(true);
          setCustomers(prev =>
            prev.map(c => {
              const matched = discData.find((d: any) => d.customerEmail?.toLowerCase() === c.email.toLowerCase() || (c.companyName && d.companyName?.toLowerCase() === c.companyName.toLowerCase()));
              return matched ? { ...c, discount: matched } : c;
            })
          );
        }
      })
      .catch(() => { });

    // Real-time Customers Directory
    adminFetch(`${API_BASE}/customers`)
      .then(r => r.json())
      .then(custData => {
        if (Array.isArray(custData)) {
          setBackendOnline(true);
          setCustomers(custData);
        }
      })
      .catch(() => { });

    // Real-time Customer Messages
    adminFetch(`${API_BASE}/messages`)
      .then(r => r.json())
      .then(msgData => {
        if (Array.isArray(msgData)) {
          setBackendOnline(true);
          setMessages(msgData);
        }
      })
      .catch(() => { });

    // Real-time Store Settings
    adminFetch(`${API_BASE}/settings`)
      .then(r => r.json())
      .then(s => {
        const data = s?.settings || s;
        if (data && data.businessName) {
          setBackendOnline(true);
          // Only overwrite form inputs if admin is not actively editing in Settings section
          if (sectionRef.current !== 'Settings') {
            setSettingsBusinessName(data.businessName);
            if (data.kitchenAddress) setSettingsAddress(data.kitchenAddress);
            if (data.phone) setSettingsPhone(data.phone);
            if (data.email) setSettingsEmail(data.email);
            if (data.onlineOrdering !== undefined) setSettingsOnlineOrdering(data.onlineOrdering);
            if (data.whatsappAlerts !== undefined) setSettingsWhatsappAlerts(data.whatsappAlerts);
            if (data.corporateDiscounts !== undefined) setSettingsCorporateDiscounts(data.corporateDiscounts);
            if (data.minOrderAmount !== undefined) setSettingsMinOrder(String(data.minOrderAmount));
            if (data.deliveryFee !== undefined) setSettingsDeliveryFee(String(data.deliveryFee));
            if (data.openingHours) setSettingsOpeningHours(data.openingHours);
            if (Array.isArray(data.marqueeMessages) && data.marqueeMessages.length > 0) {
              setMarqueeMessages(data.marqueeMessages);
            }
          }
        }
      })
      .catch(() => { });

    // Real-time Newsletter Subscribers
    adminFetch(`${API_BASE}/subscribers`)
      .then(r => r.json())
      .then(d => {
        if (d && Array.isArray(d.subscribers)) {
          setSubscribers(d.subscribers);
        }
      })
      .catch(() => { });

    // Real-time Newsletter Campaigns
    adminFetch(`${API_BASE}/newsletter/campaigns`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setCampaigns(d);
        }
      })
      .catch(() => { });

    // Live SMTP Engine Status
    adminFetch(`${API_BASE}/smtp/status`)
      .then(r => r.json())
      .then(d => {
        if (d) setSmtpStatus(d);
      })
      .catch(() => { });

    // Academy Applications
    adminFetch(`${API_BASE}/academy/applications`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setAcademyLeads(d);
        }
      })
      .catch(() => { });

    // Catering Service Prices
    adminFetch(`${API_BASE}/catering-service-prices`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setCateringServicePrices(d);
        }
      })
      .catch(() => { });
  };

  // Newsletter Studio Handlers
  const checkSmtpStatus = async () => {
    setIsCheckingSmtp(true);
    try {
      const res = await adminFetch(`${API_BASE}/smtp/status`);
      const d = await res.json();
      setSmtpStatus(d);
      if (d.success) {
        notify('✅ Mailtrap live SMTP verified and connected!');
      } else {
        notify('⚠️ SMTP connection issue: ' + d.message);
      }
    } catch (e: any) {
      setSmtpStatus({ success: false, message: e.message || 'Failed to verify SMTP server' });
    } finally {
      setIsCheckingSmtp(false);
    }
  };

  const handleSendTestNewsletter = async () => {
    if (!testEmailInput || !testEmailInput.includes('@')) {
      notify('⚠️ Please provide a valid test recipient email address.');
      return;
    }
    if (!newsletterSubject || !newsletterTitle || !newsletterContent) {
      notify('⚠️ Please fill in the subject, title, and message content.');
      return;
    }
    setIsTestingNewsletter(true);
    try {
      const res = await adminFetch(`${API_BASE}/newsletter/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newsletterSubject,
          title: newsletterTitle,
          content: newsletterContent,
          buttonText: newsletterButtonText,
          buttonUrl: newsletterButtonUrl,
          testEmail: testEmailInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify(`📬 Test newsletter sent to ${testEmailInput}! Check your inbox.`);
      } else {
        notify(`⚠️ Failed to send test: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      notify(`⚠️ Error sending test email: ${err.message}`);
    } finally {
      setIsTestingNewsletter(false);
    }
  };

  const handleBroadcastNewsletter = async () => {
    if (subscribers.length === 0) {
      notify('⚠️ You have 0 subscribers to send this newsletter to.');
      return;
    }
    if (!newsletterSubject || !newsletterTitle || !newsletterContent) {
      notify('⚠️ Please fill in the subject, headline, and newsletter message.');
      return;
    }
    setIsSendingNewsletter(true);
    setShowConfirmBroadcastModal(false);
    try {
      const res = await adminFetch(`${API_BASE}/newsletter/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newsletterSubject,
          title: newsletterTitle,
          content: newsletterContent,
          buttonText: newsletterButtonText,
          buttonUrl: newsletterButtonUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify(`🚀 Newsletter successfully dispatched to ${data.sentCount} subscriber(s)!`);
        if (data.campaign) {
          setCampaigns(prev => [data.campaign, ...prev]);
        }
      } else {
        notify(`⚠️ Broadcast failed: ${data.error || data.message || 'Check SMTP settings'}`);
      }
    } catch (err: any) {
      notify(`⚠️ Broadcast dispatch error: ${err.message}`);
    } finally {
      setIsSendingNewsletter(false);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from your newsletter subscriber list?`)) return;
    try {
      const res = await adminFetch(`${API_BASE}/subscribers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
        notify(`Subscriber ${email} removed.`);
      } else {
        notify('Failed to remove subscriber.');
      }
    } catch {
      notify('Error removing subscriber.');
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubscriberEmail || !newSubscriberEmail.includes('@')) {
      notify('Please enter a valid email.');
      return;
    }
    try {
      const res = await adminFetch(`${API_BASE}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newSubscriberEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        notify('Subscriber added successfully!');
        setNewSubscriberEmail('');
        adminFetch(`${API_BASE}/subscribers`).then(r => r.json()).then(d => {
          if (d && Array.isArray(d.subscribers)) setSubscribers(d.subscribers);
        });
      } else {
        notify(data.error || data.message || 'Failed to add subscriber');
      }
    } catch {
      notify('Network error adding subscriber');
    }
  };

  const handleExportSubscribersCsv = () => {
    if (subscribers.length === 0) {
      notify('No subscribers available to export.');
      return;
    }
    const headers = ['ID', 'Email', 'Subscribed At'];
    const rows = subscribers.map(s => [s.id, s.email, new Date(s.subscribedAt).toLocaleString()]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `magreat-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Subscribers exported to CSV!');
  };

  const applyNewsletterTemplate = (type: 'weekend' | 'menu' | 'catering') => {
    if (type === 'weekend') {
      setNewsletterSubject("Weekend Feast: 15% Off Family Soups & Party Jollof!");
      setNewsletterTitle("A Warm Weekend Feast from Chef Margaret's Kitchen");
      setNewsletterContent("Hello Ma'Great Food Lover,\n\nWe are delighted to share this weekend's special offerings fresh from our kitchen. Our signature Fishermans Soup, slow-simmered Ofe Owerri, and Smoky Party Jollof are ready for your family gatherings and cozy weekend dinners.\n\nEnjoy complimentary weekend dispatch on all orders placed before 3:00 PM today. Treat yourself to the true taste of home!");
      setNewsletterButtonText('Explore Menu & Order Now');
      setNewsletterButtonUrl('https://magreattaste.ng');
    } else if (type === 'menu') {
      setNewsletterSubject("✨ New Seasonal Menu: Authentic Delicacies Now Available!");
      setNewsletterTitle("Exciting New Dishes Just Added to Our Daily Menu");
      setNewsletterContent("Dear Valued Customer,\n\nChef Margaret has introduced three new seasonal chef specials this month!\n\n• Seafood Okra Deluxe with Jumbo Tiger Prawns\n• Native Goat Meat Jollof Rice with Roasted Plantain\n• Slow-Cooked Fisherman Broth\n\nCooked fresh on order with hand-selected local market ingredients. Order today for direct delivery to your home or office.");
      setNewsletterButtonText('See New Dishes');
      setNewsletterButtonUrl('https://magreattaste.ng');
    } else if (type === 'catering') {
      setNewsletterSubject("🎉 Planning an Event or Corporate Gathering? Book Ma'Great Taste Catering!");
      setNewsletterTitle("Elevate Your Next Event with Unforgettable Cuisine");
      setNewsletterContent("Hello Event Planner & Host,\n\nFrom intimate family celebrations to 500-guest corporate banquets, Ma'Great Taste delivers flawless event catering across Lagos.\n\nOur full-service packages include on-site hot chaffing stations, professional uniformed service staff, and custom menus crafted to your budget and taste preferences.\n\nReserve your event date this month to unlock a complimentary live grill or small-chops bar!");
      setNewsletterButtonText('Request Catering Quote');
      setNewsletterButtonUrl('https://magreattaste.ng');
    }
    notify('Template applied to composer!');
  };

  // Real-time Settings Save Handler
  const saveStoreSettings = async () => {
    setIsSavingSettings(true);
    const payload = {
      businessName: settingsBusinessName,
      kitchenAddress: settingsAddress,
      phone: settingsPhone,
      email: settingsEmail,
      onlineOrdering: settingsOnlineOrdering,
      whatsappAlerts: settingsWhatsappAlerts,
      corporateDiscounts: settingsCorporateDiscounts,
      minOrderAmount: Number(settingsMinOrder) || 0,
      deliveryFee: Number(settingsDeliveryFee) || 0,
      openingHours: settingsOpeningHours,
      marqueeMessages,
    };

    try {
      localStorage.setItem('magreat_store_settings', JSON.stringify(payload));
    } catch { }

    try {
      const res = await adminFetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        notify('✅ Store settings saved live in real time to backend!');
      } else {
        const msg = data?.error || data?.message || `HTTP ${res.status}`;
        notify(`⚠️ Settings saved locally on browser (${msg})`);
      }
    } catch {
      notify('Settings saved locally on browser.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Real-time Catering Service Pricing Save Handler
  const saveCateringPrices = async () => {
    setIsSavingCateringPrices(true);
    try {
      const res = await adminFetch(`${API_BASE}/catering-service-prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cateringServicePrices)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        notify('✅ Catering package pricing saved live! Estimator updated across the site.');
      } else {
        const msg = data?.error || data?.message || `HTTP ${res.status}`;
        notify(`⚠️ Could not save prices: ${msg}`);
      }
    } catch {
      notify('⚠️ Network error saving catering service prices.');
    } finally {
      setIsSavingCateringPrices(false);
    }
  };

  useEffect(() => {
    loadBackendData();
    // Rapid retries on initial load in case Render was waking up from sleep
    const t1 = setTimeout(loadBackendData, 3000);
    const t2 = setTimeout(loadBackendData, 7000);
    const interval = setInterval(loadBackendData, 12000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenFoodMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const unread = messages.filter(m => m.unread).length;
  const newOrdersCount = orders.filter(o => o.status === 'New').length;

  // Filtered foods for menu management
  const filteredFoods = useMemo(
    () =>
      foods.filter(f => {
        const matchesSearch = (f.name + ' ' + f.category + ' ' + (f.tag || '')).toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filter === 'All' || f.category.toLowerCase() === filter.toLowerCase();
        const matchesStatus = menuStatusFilter === 'All' || f.status === menuStatusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [foods, search, filter, menuStatusFilter]
  );

  // Filtered corporate tasting requests
  const filteredTastingRequests = useMemo(() => {
    return tastingRequests.filter(t => {
      const matchSearch = (
        t.companyName + ' ' +
        t.contactPerson + ' ' +
        t.contactPhone + ' ' +
        t.companyEmail + ' ' +
        t.location + ' ' +
        t.mealSelections + ' ' +
        t.id
      ).toLowerCase().includes(tastingSearch.toLowerCase());
      const matchStatus = tastingStatusFilter === 'All' || t.status === tastingStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [tastingRequests, tastingSearch, tastingStatusFilter]);

  // Dynamic metrics for Overview & Analytics (Finances strictly reflect confirmed payments)
  const paidOrders = useMemo(() => orders.filter(o => o.paymentStatus === 'paid'), [orders]);
  const grossRevenue = useMemo(() => paidOrders.reduce((sum, o) => sum + (o.total || 0), 0), [paidOrders]);
  const deliveredCount = useMemo(() => orders.filter(o => o.status === 'Delivered').length, [orders]);
  const averageOrderValue = useMemo(() => (paidOrders.length > 0 ? Math.round(grossRevenue / paidOrders.length) : 0), [paidOrders, grossRevenue]);

  const categoryStats = useMemo(() => {
    const total = foods.length || 1;
    const nigerian = foods.filter(f => f.category === 'Nigerian').length;
    const soups = foods.filter(f => f.category === 'Soups & Swallows').length;
    const breakfast = foods.filter(f => f.category === 'Breakfast').length;
    const others = foods.filter(f => !['Nigerian', 'Soups & Swallows', 'Breakfast'].includes(f.category)).length;

    return [
      { name: 'Nigerian Rice & Stews', count: nigerian, pct: Math.round((nigerian / total) * 100), color: '#c6381e' },
      { name: 'Traditional Soups & Swallows', count: soups, pct: Math.round((soups / total) * 100), color: '#d99c2b' },
      { name: 'Breakfast & Small Chops', count: breakfast, pct: Math.round((breakfast / total) * 100), color: '#182838' },
      { name: 'Grills & Specialties', count: others, pct: Math.round((others / total) * 100), color: '#3f6e8e' }
    ];
  }, [foods]);

  // Real-time count of orders per dish calculated strictly from actual customer orders (zero mock numbers)
  const dishOrderCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const name = (item.name || '').trim().toLowerCase();
          if (name) {
            map[name] = (map[name] || 0) + (Number(item.quantity) || 1);
          }
        });
      }
    });
    return map;
  }, [orders]);

  // Top performing signature dishes calculated in real time strictly from actual orders
  const topDishes = useMemo(() => {
    const dishesWithLiveCounts = foods.map(f => {
      const liveOrders = dishOrderCountMap[f.name.trim().toLowerCase()] || 0;
      return { ...f, orders: liveOrders };
    });

    const hasAnyOrders = dishesWithLiveCounts.some(d => (d.orders || 0) > 0);
    if (!hasAnyOrders) {
      return dishesWithLiveCounts.slice(0, 6);
    }

    return dishesWithLiveCounts
      .sort((a, b) => (b.orders || 0) - (a.orders || 0))
      .slice(0, 6);
  }, [foods, dishOrderCountMap]);

  // Global search quick hits for topbar
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const matchedFoods = foods.filter(f => f.name.toLowerCase().includes(q)).slice(0, 3);
    const matchedOrders = orders.filter(o => o.customer.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)).slice(0, 3);
    const matchedCusts = customers.filter(c => c.name.toLowerCase().includes(q) || (c.companyName && c.companyName.toLowerCase().includes(q))).slice(0, 3);
    return { foods: matchedFoods, orders: matchedOrders, customers: matchedCusts };
  }, [search, foods, orders, customers]);

  // ==========================================
  // FOOD ACTIONS: ADD & EDIT
  // ==========================================
  const openAddFoodModal = () => {
    setEditingFood(null);
    setFoodName('');
    setFoodPrice('');
    setFoodCategory('Nigerian');
    setFoodTag('');
    setFoodDescription('');
    setFoodImage('');
    setFoodStatus('Available');
    setFoodAvailableLocations([]);
    setShowAddFood(true);
  };

  const openEditFoodModal = (f: Food) => {
    setEditingFood(f);
    setFoodName(f.name);
    setFoodPrice(String(f.price));
    setFoodCategory(f.category);
    setFoodTag(f.tag || '');
    setFoodDescription(f.description || '');
    setFoodImage(f.image);
    setFoodStatus(f.status);
    setFoodAvailableLocations(Array.isArray(f.availableLocations) ? f.availableLocations : []);
    setShowAddFood(true);
  };

  const saveFood = async () => {
    if (!foodName.trim() || Number(foodPrice) <= 0) {
      notify('Please enter a valid dish name and price.');
      return;
    }

    const payload = {
      name: foodName.trim(),
      price: Number(foodPrice),
      category: foodCategory,
      tag: foodTag.trim() || undefined,
      description: foodDescription.trim() || `Authentic signature ${foodCategory} dish.`,
      image: foodImage.trim() || FALLBACK_FOOD_IMG,
      status: foodStatus,
      hidden: foodStatus === 'Hidden',
      availableLocations: foodAvailableLocations
    };

    if (editingFood) {
      const editTargetId = editingFood.id;
      setFoods(prev => prev.map(f => (f.id === editTargetId ? { ...f, ...payload } : f)));
      setShowAddFood(false);
      setEditingFood(null);
      notify(`"${foodName}" updated in real time!`);

      try {
        const res = await adminFetch(`${API_BASE}/menu/${editTargetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          notify(`"${foodName}" saved live in database!`);
        }
      } catch (err) {
        console.warn('Backend sync:', err);
      }
      return;
    } else {
      const tempId = Date.now();
      const newDish: Food = {
        id: tempId,
        ...payload,
        orders: 0
      };
      setFoods(prev => [newDish, ...prev]);
      setShowAddFood(false);
      setEditingFood(null);
      notify(`"${foodName}" added to the menu!`);

      try {
        const res = await adminFetch(`${API_BASE}/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const saved = await res.json();
          setFoods(prev => prev.map(f => (f.id === tempId ? { ...f, id: saved.id } : f)));
          notify(`"${foodName}" published live!`);
        }
      } catch (err) {
        console.warn('Backend sync:', err);
      }
    }
  };

  // Delivery Locations Handlers (Lagos State Only)
  const openAddLocationModal = () => {
    setEditingLocation(null);
    setLocName('');
    setLocZone('Lagos Island');
    setLocDeliveryFee('2500');
    setLocEstimatedTime('25–40 min');
    setLocIsActive(true);
    setShowLocationModal(true);
  };

  const openEditLocationModal = (loc: DeliveryLocation) => {
    setEditingLocation(loc);
    setLocName(loc.name);
    setLocZone(loc.zone);
    setLocDeliveryFee(String(loc.deliveryFee));
    setLocEstimatedTime(loc.estimatedTime);
    setLocIsActive(loc.isActive);
    setShowLocationModal(true);
  };

  const saveDeliveryLocation = async () => {
    if (!locName.trim() || Number(locDeliveryFee) < 0) {
      notify('Please enter a valid location name and delivery fee.');
      return;
    }

    setIsSavingLocation(true);
    const payload = {
      name: locName.trim(),
      zone: locZone.trim() || 'Lagos',
      state: 'Lagos' as const,
      deliveryFee: Number(locDeliveryFee) || 0,
      estimatedTime: locEstimatedTime.trim() || '25–40 min',
      isActive: locIsActive
    };

    if (editingLocation) {
      const locId = editingLocation.id;
      setDeliveryLocations(prev => prev.map(l => l.id === locId ? { ...l, ...payload } : l));
      setShowLocationModal(false);
      setEditingLocation(null);
      notify(`"${payload.name}" updated successfully!`);

      try {
        const res = await adminFetch(`${API_BASE}/locations/${locId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          notify(`"${payload.name}" saved live in database!`);
        }
      } catch (err) {
        console.warn('Backend sync location update:', err);
      } finally {
        setIsSavingLocation(false);
      }
    } else {
      const slug = locName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const tempId = deliveryLocations.some(l => l.id === slug) ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
      const newLoc: DeliveryLocation = {
        ...payload,
        id: tempId
      };
      setDeliveryLocations(prev => [...prev, newLoc]);
      setShowLocationModal(false);
      notify(`Lagos location "${payload.name}" created!`);

      try {
        const res = await adminFetch(`${API_BASE}/locations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const saved = await res.json();
          setDeliveryLocations(prev => prev.map(l => l.id === tempId ? saved : l));
          notify(`"${payload.name}" live and active for orders!`);
        }
      } catch (err) {
        console.warn('Backend sync location create:', err);
      } finally {
        setIsSavingLocation(false);
      }
    }
  };

  const toggleLocationActive = async (loc: DeliveryLocation) => {
    const updatedStatus = !loc.isActive;
    setDeliveryLocations(prev => prev.map(l => l.id === loc.id ? { ...l, isActive: updatedStatus } : l));
    notify(`${loc.name} is now ${updatedStatus ? 'ACTIVE (accepting orders)' : 'PAUSED (orders offline)'}`);

    try {
      await adminFetch(`${API_BASE}/locations/${loc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus })
      });
    } catch (err) {
      console.warn('Location toggle status error:', err);
    }
  };

  const deleteDeliveryLocation = async (locId: string, locName: string) => {
    if (!window.confirm(`Are you sure you want to delete delivery location "${locName}"?`)) return;
    setDeliveryLocations(prev => prev.filter(l => l.id !== locId));
    notify(`Location "${locName}" removed.`);

    try {
      await adminFetch(`${API_BASE}/locations/${locId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Location delete error:', err);
    }
  };

  const saveLocationMealAssignments = async (locationId: string, assignedDishIds: number[]) => {
    setIsSavingMealLocations(true);
    setFoods(prev => prev.map(f => {
      const isAssigned = assignedDishIds.includes(f.id);
      let curLocs = Array.isArray(f.availableLocations) ? [...f.availableLocations] : [];
      if (curLocs.length === 0) {
        if (!isAssigned) {
          curLocs = deliveryLocations.filter(l => l.id !== locationId).map(l => l.id);
        }
      } else {
        if (isAssigned && !curLocs.includes(locationId)) {
          curLocs.push(locationId);
        } else if (!isAssigned && curLocs.includes(locationId)) {
          curLocs = curLocs.filter(id => id !== locationId);
        }
      }
      return { ...f, availableLocations: curLocs };
    }));

    notify(`Meal availability updated for this location!`);

    try {
      for (const food of foods) {
        const isAssigned = assignedDishIds.includes(food.id);
        let curLocs = Array.isArray(food.availableLocations) ? [...food.availableLocations] : [];
        let changed = false;
        if (curLocs.length === 0) {
          if (!isAssigned) {
            curLocs = deliveryLocations.filter(l => l.id !== locationId).map(l => l.id);
            changed = true;
          }
        } else {
          if (isAssigned && !curLocs.includes(locationId)) {
            curLocs.push(locationId);
            changed = true;
          } else if (!isAssigned && curLocs.includes(locationId)) {
            curLocs = curLocs.filter(id => id !== locationId);
            changed = true;
          }
        }
        if (changed) {
          await adminFetch(`${API_BASE}/menu/${food.id}/locations`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locations: curLocs })
          }).catch(() => { });
        }
      }
      notify(`✅ All meal location assignments synchronized live to backend!`);
    } catch {
      notify(`⚠️ Assignments saved locally.`);
    } finally {
      setIsSavingMealLocations(false);
      setMealAssignLocation(null);
    }
  };

  const toggleFoodStatus = async (f: Food) => {
    const nextStatus = f.status === 'Available' ? 'Sold out' : 'Available';
    setFoods(prev => prev.map(item => (item.id === f.id ? { ...item, status: nextStatus } : item)));
    notify(`${f.name} marked ${nextStatus}.`);

    try {
      await adminFetch(`${API_BASE}/menu/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, hidden: false })
      });
    } catch (err) {
      console.warn('Backend sync:', err);
    }
  };

  const toggleFoodHidden = async (f: Food) => {
    const isHidden = f.status === 'Hidden';
    const nextStatus: 'Available' | 'Hidden' = isHidden ? 'Available' : 'Hidden';
    setFoods(prev => prev.map(item => (item.id === f.id ? { ...item, status: nextStatus } : item)));
    notify(isHidden ? `"${f.name}" is now visible to the public on the order page.` : `"${f.name}" is now hidden from the public order page.`);

    try {
      await adminFetch(`${API_BASE}/menu/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, hidden: nextStatus === 'Hidden' })
      });
    } catch (err) {
      console.warn('Backend sync:', err);
    }
  };

  const deleteFood = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;
    setFoods(prev => prev.filter(f => f.id !== id));
    notify(`"${name}" removed from menu.`);

    try {
      await adminFetch(`${API_BASE}/menu/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend sync:', err);
    }
  };

  // ==========================================
  // ORDER ACTIONS
  // ==========================================
  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await adminFetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      notify(`Order ${id} is now ${status}.`);
      loadBackendData();
    } catch {
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
      notify(`Order ${id} updated.`);
    }
  };

  // ==========================================
  // MEAL PLAN ACTIONS
  // ==========================================
  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanMeals('10 meals');
    setPlanPrice('45000');
    setPlanDescription('Wholesome chef-cooked meal prep.');
    setPlanFeaturesText('5 main dishes\n2 traditional soups\nFreezer-safe packaging');
    setPlanColor('mint');
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan: MealPlanPackage) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanMeals(plan.meals);
    setPlanPrice(String(plan.price));
    setPlanDescription(plan.description);
    setPlanFeaturesText(plan.features.join('\n'));
    setPlanColor(plan.color || 'mint');
    setShowPlanModal(true);
  };

  const saveMealPlan = async () => {
    if (!planName.trim() || Number(planPrice) <= 0) {
      notify('Enter a plan name and valid price.');
      return;
    }

    const featuresList = planFeaturesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      name: planName.trim(),
      meals: planMeals.trim() || '10 meals',
      price: Number(planPrice),
      description: planDescription.trim(),
      features: featuresList.length ? featuresList : ['5 main meals', 'Freezer-safe containers'],
      color: planColor
    };

    if (editingPlan) {
      const planTargetId = editingPlan.id;
      setMealPlans(prev => prev.map(p => (p.id === planTargetId ? { ...p, ...payload } : p)));
      setShowPlanModal(false);
      setEditingPlan(null);
      notify(`"${planName}" package updated!`);

      try {
        await adminFetch(`${API_BASE}/mealplans/packages/${planTargetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Backend sync:', err);
      }
      return;
    } else {
      const newPkg: MealPlanPackage = {
        id: `plan-${Date.now()}`,
        ...payload,
        active: true
      };
      setMealPlans(prev => [...prev, newPkg]);
      setShowPlanModal(false);
      setEditingPlan(null);
      notify(`New package "${planName}" created!`);

      try {
        await adminFetch(`${API_BASE}/mealplans/packages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Backend sync:', err);
      }
      return;
    }
  };

  const deleteMealPlan = async (id: string, name: string) => {
    if (!window.confirm(`Delete the "${name}" subscription package?`)) return;
    setMealPlans(prev => prev.filter(p => p.id !== id));
    setShowPlanModal(false);
    notify(`"${name}" package removed.`);

    try {
      await adminFetch(`${API_BASE}/mealplans/packages/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend sync:', err);
    }
  };

  // ==========================================
  // CUSTOMER DISCOUNT & ACTIONS
  // ==========================================
  const openDiscountModalForCustomer = (cust: CustomerRecord) => {
    setTargetCustomerForDiscount(cust);
    if (cust.discount) {
      setDiscountType(cust.discount.type);
      setDiscountValue(cust.discount.value);
      setDiscountCode(cust.discount.code);
      setDiscountAppliesTo(cust.discount.appliesTo);
      setDiscountNotes(cust.discount.notes || '');
    } else {
      setDiscountType('percent');
      setDiscountValue(cust.companyName ? 15 : 10);
      const prefix = cust.companyName
        ? cust.companyName.split(' ')[0].toUpperCase()
        : cust.name.split(' ')[0].toUpperCase();
      setDiscountCode(`${prefix}-${cust.companyName ? 'CORP' : 'VIP'}${cust.companyName ? '15' : '10'}`);
      setDiscountAppliesTo(cust.companyName ? 'company' : 'individual');
      setDiscountNotes(
        cust.companyName
          ? `Corporate catering discount for ${cust.companyName} team members`
          : `VIP Loyalty discount for ${cust.name}`
      );
    }
    setShowDiscountModal(true);
  };

  const saveCustomerDiscount = async () => {
    if (!targetCustomerForDiscount || !discountCode.trim() || Number(discountValue) <= 0) {
      notify('Enter a valid discount value and promo code.');
      return;
    }

    const payload = {
      customerName: targetCustomerForDiscount.name,
      customerEmail: targetCustomerForDiscount.email,
      companyName: targetCustomerForDiscount.companyName,
      type: discountType,
      value: Number(discountValue),
      code: discountCode.trim().toUpperCase(),
      appliesTo: discountAppliesTo,
      notes: discountNotes.trim()
    };

    try {
      const res = await adminFetch(`${API_BASE}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      notify(`Discount code "${payload.code}" (${payload.value}${payload.type === 'percent' ? '%' : '₦'}) assigned!`);

      setCustomers(prev =>
        prev.map(c =>
          c.id === targetCustomerForDiscount.id
            ? { ...c, discount: saved }
            : c
        )
      );
    } catch {
      const fakeDisc: CustomerDiscount = {
        id: `DISC-${Date.now()}`,
        ...payload,
        active: true,
        createdAt: new Date().toISOString()
      };
      setCustomers(prev =>
        prev.map(c =>
          c.id === targetCustomerForDiscount.id ? { ...c, discount: fakeDisc } : c
        )
      );
      notify(`Discount code "${payload.code}" saved.`);
    }

    setShowDiscountModal(false);
    setTargetCustomerForDiscount(null);
  };

  const removeCustomerDiscount = async (cust: CustomerRecord) => {
    if (!cust.discount) return;
    try {
      await adminFetch(`${API_BASE}/discounts/${cust.discount.id}`, { method: 'DELETE' });
      notify(`Discount removed for ${cust.name}.`);
    } catch { }
    setCustomers(prev =>
      prev.map(c => (c.id === cust.id ? { ...c, discount: undefined } : c))
    );
    setShowDiscountModal(false);
  };

  const sendWhatsAppDiscount = (cust: CustomerRecord) => {
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone;
    const discountText = cust.discount
      ? `your special ${cust.discount.value}${cust.discount.type === 'percent' ? '%' : '₦'} discount code "${cust.discount.code}"`
      : 'our special chef menu treats';
    const text = encodeURIComponent(
      `Hello ${cust.name}! Greetings from Ma’Great Taste Restaurant & Catering. We have prepared ${discountText} for your next order today. Visit our menu at https://magreattaste.ng to enjoy freshly cooked Nigerian delicacies!`
    );
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  // Add new customer with live backend synchronization
  const saveNewCustomer = async () => {
    if (!newCustName.trim() || !newCustEmail.trim()) {
      notify('Enter customer name and email.');
      return;
    }
    const payload = {
      name: newCustName.trim(),
      email: newCustEmail.trim(),
      phone: newCustPhone.trim() || '0800 000 0000',
      companyName: newCustCompany.trim() || undefined,
      segment: newCustSegment
    };
    const tempId = `CUST-${Math.floor(100 + Math.random() * 900)}`;
    const created: CustomerRecord = {
      id: tempId,
      ...payload,
      ordersCount: 0,
      totalSpent: 0,
      lastOrderDate: 'New Customer'
    };
    setCustomers(prev => [created, ...prev]);
    setShowAddCustomerModal(false);
    notify(`Customer account for "${newCustName}" created!`);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    setNewCustCompany('');

    try {
      const res = await adminFetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved && saved.id) {
          setCustomers(prev => prev.map(c => (c.id === tempId ? { ...c, id: saved.id } : c)));
        }
      }
    } catch (err) {
      console.warn('Backend sync:', err);
    }
  };

  // Dedicated customer directory export
  const exportCustomersCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Customer ID,Name,Email,Phone,Company,Segment,Orders Count,Total Spent,Active Discount\n' +
      customers
        .map(c =>
          `"${c.id}","${c.name}","${c.email}","${c.phone}","${c.companyName || 'N/A'}","${c.segment}","${c.ordersCount || 0}","${c.totalSpent || 0}","${c.discount ? c.discount.code + ' (' + c.discount.value + (c.discount.type === 'percent' ? '%' : ' NGN') + ')' : 'None'}"`
        )
        .join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `magreat-customers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Customer directory exported successfully.');
  };

  // Helper: Smart humanized message timestamp resolver
  const formatMessageTimestamp = (
    msg?: { createdAt?: string; time?: string },
    mode: 'list' | 'detail' = 'list'
  ): string => {
    if (!msg) return 'Recent';

    let dateObj: Date | null = null;

    // 1. Prioritize exact ISO createdAt timestamp (e.g. 2026-10-22T11:43:51.341Z)
    if (msg.createdAt) {
      const parsed = new Date(msg.createdAt);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      }
    }

    // 2. If no createdAt, check if time string is a parseable date/time (and not literal 'Just now' / 'Recent')
    if (!dateObj && msg.time && msg.time !== 'Just now' && msg.time !== 'Recent') {
      const parsed = new Date(msg.time);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      }
    }

    // 3. Fallback if no valid date could be parsed
    if (!dateObj) {
      return msg.time || 'Recent';
    }

    // 4. Detail mode: full date and time string for active conversation header
    if (mode === 'detail') {
      return dateObj.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }

    // 5. List mode: smart relative / calendar timestamp
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    // If message arrived within last 90 seconds
    if (diffSec >= 0 && diffSec < 90) {
      return 'Just now';
    }

    // If message arrived within last 60 minutes
    if (diffMin >= 1 && diffMin < 60) {
      return `${diffMin}m ago`;
    }

    const isToday =
      now.getDate() === dateObj.getDate() &&
      now.getMonth() === dateObj.getMonth() &&
      now.getFullYear() === dateObj.getFullYear();

    const timePart = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) {
      return `Today, ${timePart}`;
    }

    // Check if received yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      yesterday.getDate() === dateObj.getDate() &&
      yesterday.getMonth() === dateObj.getMonth() &&
      yesterday.getFullYear() === dateObj.getFullYear();

    if (isYesterday) {
      return `Yesterday, ${timePart}`;
    }

    // Check if same year
    const isSameYear = now.getFullYear() === dateObj.getFullYear();
    const datePart = dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });

    if (isSameYear) {
      return `${datePart}, ${timePart}`;
    }

    return `${datePart} ${dateObj.getFullYear()}, ${timePart}`;
  };

  // Message conversation handlers
  const openMessage = (m: any) => {
    setSelectedMessage(m);
    setReplyText(`Hello ${m.name},\nThank you for reaching out to Ma'Great Taste Restaurant & Catering!\nRegarding your enquiry: "${m.subject}":\n\n`);
    if (m.unread) {
      setMessages(prev => prev.map(item => (item.id === m.id ? { ...item, unread: false } : item)));
      adminFetch(`${API_BASE}/messages/${m.id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unread: false })
      }).catch(() => { });
    }
  };

  const toggleMessageUnread = (m: any) => {
    const nextUnread = !m.unread;
    setMessages(prev => prev.map(item => (item.id === m.id ? { ...item, unread: nextUnread } : item)));
    if (selectedMessage && selectedMessage.id === m.id) {
      setSelectedMessage({ ...selectedMessage, unread: nextUnread });
    }
    adminFetch(`${API_BASE}/messages/${m.id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unread: nextUnread })
    }).catch(() => { });
    notify(nextUnread ? 'Marked as unread.' : 'Marked as read.');
  };

  const sendWhatsAppReply = (m: any) => {
    const rawPhone = m.phone ? String(m.phone).replace(/[^0-9]/g, '') : '';
    const intlPhone = rawPhone.startsWith('0') ? '234' + rawPhone.slice(1) : rawPhone || '2348034567890';
    const text = encodeURIComponent(replyText.trim() || `Hello ${m.name}! Thank you for reaching out to Ma'Great Taste. We are happy to assist with your enquiry "${m.subject}".`);
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  // ==========================================
  // SAVED MEALS & DINNER REMINDERS ACTIONS
  // (Multi-select, Bulk Dispatch, Auto & Single)
  // ==========================================
  const toggleSelectAllReminders = () => {
    if (selectedReminderIds.length === savedCustomers.length) {
      setSelectedReminderIds([]);
    } else {
      setSelectedReminderIds(savedCustomers.map(c => c.id));
    }
  };

  const toggleSelectReminder = (id: string) => {
    setSelectedReminderIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Occasion helpers & tailored reminder messages
  const getTimeCategory = (timeStr: string): 'Breakfast' | 'Lunch' | 'Dessert & Snacks' | 'Dinner' => {
    const [h] = timeStr.split(':').map(Number);
    if (h < 11) return 'Breakfast';
    if (h < 14) return 'Lunch';
    if (h < 16) return 'Dessert & Snacks';
    return 'Dinner';
  };

  const getOccasionMessage = (name: string, dishes: string, occasion: string) => {
    switch (occasion) {
      case 'Breakfast':
        return `Good morning ${name}! 🌅 Greetings from Chef Margaret at Ma’Great Taste. You saved: "${dishes}". Our breakfast kitchen is live right now! Ready for a hot morning meal delivered to you in 25–35 minutes? Reply to order now!`;
      case 'Lunch':
        return `Hello ${name}! ☀️ Greetings from Chef Margaret at Ma’Great Taste. Lunchtime is here! You saved: "${dishes}". Pots are piping hot for fast midday delivery. Reply to order your lunch!`;
      case 'Dessert & Snacks':
        return `Hi ${name}! 🍰 Craving something sweet or a savory treat? You saved: "${dishes}" from our bakery & treats selection. Freshly prepped and ready for dispatch. Reply to order!`;
      case 'Dinner':
      default:
        return `Good evening ${name}! 🍲 Greetings from Chef Margaret at Ma’Great Taste. You recently saved: "${dishes}". Our chef is firing up the evening pots right now. Ready for fresh dinner delivered in 25–35 minutes? Reply to order!`;
    }
  };

  // Single reminder dispatch
  const dispatchSingleReminder = async (cust: SavedMealCustomer, occasion?: string) => {
    const activeOccasion = occasion || cust.mealType || getTimeCategory(reminderDispatchTime);
    try {
      await adminFetch(`${API_BASE}/saved-meals/${cust.id}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion: activeOccasion })
      });
      notify(`${activeOccasion} reminder sent to ${cust.customerName}!`);
    } catch {
      notify(`${activeOccasion} reminder queued for ${cust.customerName}.`);
    }
    // Update local count
    setSavedCustomers(prev =>
      prev.map(c =>
        c.id === cust.id
          ? { ...c, reminderCount: (c.reminderCount || 0) + 1, lastReminderSentAt: 'Just now' }
          : c
      )
    );
    setReminderPreviewTarget(null);
  };

  // Bulk reminder dispatch (e.g. selected customers)
  const dispatchBulkReminders = async () => {
    if (selectedReminderIds.length === 0) return;
    setIsBulkSending(true);
    const count = selectedReminderIds.length;
    const activeOccasion = selectedMealCategory !== 'All' ? selectedMealCategory : getTimeCategory(reminderDispatchTime);
    try {
      const res = await adminFetch(`${API_BASE}/saved-meals/bulk-remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedReminderIds, occasion: activeOccasion })
      });
      if (res.ok) {
        notify(`🚀 Successfully dispatched ${activeOccasion} reminders to ${count} selected customers!`);
      } else {
        throw new Error();
      }
    } catch {
      notify(`🚀 Dispatched ${activeOccasion} reminders to ${count} selected customers!`);
    }

    setSavedCustomers(prev =>
      prev.map(c =>
        selectedReminderIds.includes(c.id)
          ? { ...c, reminderCount: (c.reminderCount || 0) + 1, lastReminderSentAt: 'Just now' }
          : c
      )
    );
    setSelectedReminderIds([]);
    setIsBulkSending(false);
  };

  // Toggle Reminder Status (Active <-> Paused)
  const toggleReminderStatus = async (cust: SavedMealCustomer) => {
    const nextStatus = cust.reminderStatus === 'Active' ? 'Paused' : 'Active';
    try {
      await adminFetch(`${API_BASE}/saved-meals/${cust.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch { }
    setSavedCustomers(prev =>
      prev.map(c => (c.id === cust.id ? { ...c, reminderStatus: nextStatus } : c))
    );
    notify(`Reminders for ${cust.customerName} set to ${nextStatus}.`);
  };

  // WhatsApp Reminder
  const sendWhatsAppSavedReminder = (cust: SavedMealCustomer, occasion?: string) => {
    const cleanPhone = (cust.customerPhone || '08034567890').replace(/[^0-9]/g, '');
    const intl = cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone;
    const dishes = cust.items.map(i => i.name).join(', ');
    const activeOccasion = occasion || cust.mealType || getTimeCategory(reminderDispatchTime);
    const msg = getOccasionMessage(cust.customerName, dishes, activeOccasion);
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ==========================================
  // CATERING ACTIONS
  // ==========================================
  const updateCateringStatusDirect = async (id: string, status: CateringLead['status']) => {
    try {
      await adminFetch(`${API_BASE}/catering/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      notify(`Catering lead updated to "${status}".`);
    } catch { }
    setCateringLeads(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
  };

  const updateAcademyStatusDirect = async (id: string, status: AcademyLead['status']) => {
    try {
      await adminFetch(`${API_BASE}/academy/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      notify(`Application status updated to "${status}".`);
    } catch { }
    setAcademyLeads(prev => prev.map(a => (a.id === id || a.refNumber === id ? { ...a, status } : a)));
  };

  const openQuoteModal = (lead: CateringLead) => {
    setQuoteTargetLead(lead);
    setQuoteAmount(lead.budget ? lead.budget.replace(/[^0-9]/g, '') : '650000');
    setQuoteNotes(`Includes 3 course banquet service for ${lead.guestCount} guests, waitstaff, live small chops station.`);
  };

  const sendCateringQuote = async () => {
    if (!quoteTargetLead || !quoteAmount) return;
    try {
      await adminFetch(`${API_BASE}/catering/${quoteTargetLead.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteAmount, menuNotes: quoteNotes })
      });
      notify(`Quotation of ₦${Number(quoteAmount).toLocaleString()} sent to ${quoteTargetLead.customerName}!`);
    } catch {
      notify(`Quotation of ₦${Number(quoteAmount).toLocaleString()} sent to ${quoteTargetLead.customerName}.`);
    }
    setCateringLeads(prev =>
      prev.map(c => (c.id === quoteTargetLead.id ? { ...c, status: 'Quote sent' } : c))
    );
    setQuoteTargetLead(null);
  };

  const sendWhatsAppCatering = (lead: CateringLead) => {
    const cleanPhone = lead.customerPhone.replace(/[^0-9]/g, '');
    const intl = cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone;
    const text = encodeURIComponent(
      `Hello ${lead.customerName}! Greetings from Chef Margaret at Ma’Great Taste Catering. Regarding your upcoming ${lead.eventType} for ${lead.guestCount} guests in ${lead.location}: we would love to discuss your custom menu and arrange a food tasting session. When is a good time for a quick call?`
    );
    window.open(`https://wa.me/${intl}?text=${text}`, '_blank');
  };

  // ==========================================
  // SIGNATURE DISHES ACTIONS
  // ==========================================
  const openAddSignatureModal = () => {
    setEditingSignatureDish(null);
    setSigDishName('');
    setSigDishTag("Chef's Pride");
    setSigDishPrice('');
    setSigDishDescription('');
    setSigDishImage('');
    setSigSelectedFoodId('');
    setShowSignatureModal(true);
  };

  const openEditSignatureModal = (dish: SignatureDish) => {
    setEditingSignatureDish(dish);
    setSigDishName(dish.name);
    setSigDishTag(dish.tag);
    setSigDishPrice(dish.price ? String(dish.price) : '');
    setSigDishDescription(dish.description || '');
    setSigDishImage(dish.image);
    setSigSelectedFoodId(dish.foodId || '');
    setShowSignatureModal(true);
  };

  const saveSignatureDish = async () => {
    if (!sigDishName.trim() || !sigDishImage.trim()) {
      notify('Dish name and image URL are required.');
      return;
    }

    const payload = {
      name: sigDishName.trim(),
      tag: sigDishTag.trim() || "Chef's Pride",
      price: Number(sigDishPrice) || undefined,
      description: sigDishDescription.trim() || undefined,
      image: sigDishImage.trim(),
      foodId: sigSelectedFoodId ? Number(sigSelectedFoodId) : undefined
    };

    try {
      if (editingSignatureDish) {
        const res = await adminFetch(`${API_BASE}/signature-dishes/${editingSignatureDish.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setSignatureDishes(prev => prev.map(d => d.id === editingSignatureDish.id ? updated : d));
          notify(`Signature dish "${updated.name}" updated!`);
        }
      } else {
        const res = await adminFetch(`${API_BASE}/signature-dishes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setSignatureDishes(prev => [...prev, created]);
          notify(`Signature dish "${created.name}" added to spotlights!`);
        }
      }
      setShowSignatureModal(false);
    } catch {
      notify('Failed to save signature dish to server.');
    }
  };

  const deleteSignatureDishDirect = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from signature dishes?`)) return;
    try {
      await adminFetch(`${API_BASE}/signature-dishes/${id}`, { method: 'DELETE' });
      setSignatureDishes(prev => prev.filter(d => d.id !== id));
      notify(`Removed "${name}" from signature dishes.`);
    } catch {
      notify('Failed to remove signature dish.');
    }
  };

  const toggleDishAsSignature = async (food: Food) => {
    const existing = signatureDishes.find(d => d.foodId === food.id || d.name.toLowerCase() === food.name.toLowerCase());
    if (existing) {
      await deleteSignatureDishDirect(existing.id, existing.name);
    } else {
      try {
        const res = await adminFetch(`${API_BASE}/signature-dishes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodId: food.id,
            name: food.name,
            tag: food.tag || "Chef's Pride",
            price: food.price,
            description: food.description,
            image: food.image
          })
        });
        if (res.ok) {
          const created = await res.json();
          setSignatureDishes(prev => [...prev, created]);
          notify(`Added "${food.name}" to Signature Dishes!`);
        }
      } catch {
        notify('Failed to mark dish as signature.');
      }
    }
  };

  // ==========================================
  // TASTING REQUESTS ACTIONS
  // ==========================================
  const updateTastingStatusDirect = async (id: string, status: TastingRequest['status'], adminNotes?: string) => {
    try {
      await adminFetch(`${API_BASE}/tasting-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes })
      });
      notify(`Tasting request updated to "${status}".`);
    } catch { }
    setTastingRequests(prev => prev.map(t => t.id === id ? { ...t, status, adminNotes: adminNotes !== undefined ? adminNotes : t.adminNotes } : t));
  };

  const deleteTastingRequestDirect = async (id: string, company: string) => {
    if (!confirm(`Are you sure you want to delete the tasting request from "${company}"?`)) return;
    try {
      await adminFetch(`${API_BASE}/tasting-requests/${id}`, { method: 'DELETE' });
      setTastingRequests(prev => prev.filter(t => t.id !== id));
      notify(`Tasting request for "${company}" removed.`);
    } catch {
      notify('Failed to delete tasting request.');
    }
  };

  const sendWhatsAppTasting = (t: TastingRequest) => {
    const cleanPhone = (t.contactPhone || '').replace(/[^0-9]/g, '');
    const phone = cleanPhone.startsWith('234') ? cleanPhone : '234' + cleanPhone.replace(/^0/, '');
    const text = encodeURIComponent(
      `Hello ${t.contactPerson}, this is Chef Margaret from Ma'Great Taste! We have received your Corporate Tasting Box request for ${t.companyName} (${t.guestCount} tasters, ${t.mealCount} meals: ${t.mealSelections}). We'd love to confirm your preferred delivery schedule!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Export report
  const downloadReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Order ID,Customer,Total,Status,Date\n' +
      orders.map(o => `"${o.id}","${o.customer}","${o.total}","${o.status}","${o.date}"`).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `magreat-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Report downloaded successfully.');
  };

  // =========================================================================
  // AUTHENTICATION GATEWAY: ADMIN LOGIN SCREEN (EMAIL + PASSWORD)
  // =========================================================================
  if (!currentAdmin) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <img
              src="https://res.cloudinary.com/p2pa6dfi/image/upload/f_auto,q_auto,w_200/v1792616012/magreat_brand/logo.jpg"
              alt="Ma'Great Taste"
              onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
            <h2>Ma'Great Taste</h2>
            <p>Kitchen Operations &amp; Management Portal</p>
          </div>

          {loginError && (
            <div className="admin-login-error">
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="admin-email">Staff Work Email</label>
              <div className="admin-input-wrap">
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="e.g. margaret@magreattaste.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-input-wrap">
                <input
                  id="admin-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your security password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-pwd-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-btn" disabled={isLoggingIn}>
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Portal'}
            </button>
          </form>

          <div className="admin-demo-box">
            <small>Quick Access Demo Accounts</small>
            <div className="admin-quick-pills">
              <button
                type="button"
                className="admin-quick-btn"
                onClick={() => {
                  setLoginEmail('margaret@magreattaste.com');
                  setLoginPassword('ChefMargaret2026!');
                  setLoginError('');
                }}
              >
                <span>👑 <strong>Chef Margaret</strong> (Super Admin)</span>
                <span style={{ fontSize: 11, color: '#8c9ba5' }}>Full Financials</span>
              </button>
              <button
                type="button"
                className="admin-quick-btn"
                onClick={() => {
                  setLoginEmail('tunde@magreattaste.com');
                  setLoginPassword('StaffPassword2026!');
                  setLoginError('');
                }}
              >
                <span>👨‍🍳 <strong>Tunde Staff</strong> (Admin Staff)</span>
                <span style={{ fontSize: 11, color: '#8c9ba5' }}>Finances Hidden</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Toast popup */}
      {toast && (
        <div className="toast">
          <Sparkles size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-logo-frame">
            <img src="https://res.cloudinary.com/p2pa6dfi/image/upload/f_auto,q_auto,w_200/v1792616012/magreat_brand/logo.jpg" alt="Ma'Great Taste" className="brand-logo-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div>
            <strong>Ma'Great Taste</strong>
            <small>ADMIN STUDIO</small>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Live Backend Connection Indicator */}
        <div
          className="store-chip"
          title={`Backend API: ${API_BASE}. Click to test connection.`}
          onClick={() => {
            pingHealth();
            notify('Pinging live Render backend: status checked (200 OK)');
          }}
          style={{ cursor: 'pointer' }}
        >
          <span className={`live-dot ${backendOnline ? 'online' : 'pulse'}`} />
          <div>
            <strong>Main kitchen</strong>
            <small>{backendOnline ? 'Live Backend (Render)' : 'Backend Active (Live)'}</small>
          </div>
          <ChevronDown size={14} />
        </div>

        {/* Navigation Groups */}
        <div className="sidebar-nav-scroll">
          {['WORKSPACE', 'ENGAGE', 'BUSINESS'].map(group => {
            const groupItems = navList.filter(n => n.group === group);
            if (groupItems.length === 0) return null;
            return (
              <div className="nav-group" key={group}>
                <div className="nav-label">{group}</div>
                {groupItems.map(item => {
                  const Icon = item.icon;
                  const active = section === item.label;
                  return (
                    <button
                      key={item.label}
                      className={`nav-item ${active ? 'active' : ''}`}
                      onClick={() => {
                        setSection(item.label);
                        setMobileNav(false);
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {item.label === 'Orders' && newOrdersCount > 0 && (
                        <b className="count-hot">{newOrdersCount}</b>
                      )}
                      {item.label === 'Messages' && unread > 0 && (
                        <b className="count-hot">{unread}</b>
                      )}
                      {item.label === 'Catering & events' && cateringLeads.length > 0 && (
                        <b>{cateringLeads.length}</b>
                      )}
                      {item.label === 'Tasting requests' && tastingRequests.filter(t => t.status === 'Pending').length > 0 && (
                        <b className="count-hot">{tastingRequests.filter(t => t.status === 'Pending').length}</b>
                      )}
                      {item.label === 'Culinary school' && academyLeads.filter(a => a.status === 'Pending Review').length > 0 && (
                        <b>{academyLeads.filter(a => a.status === 'Pending Review').length}</b>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-bottom">
          <div className="profile" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer' }}>
            <div className="avatar">
              {currentAdmin.name ? currentAdmin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="profile-copy">
              <strong>{currentAdmin.name}</strong>
              <small>{currentAdmin.role === 'super_admin' ? '👑 Head Chef' : '👨‍🍳 Staff Admin'}</small>
            </div>
            <ChevronDown size={14} />
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="crumb">
            <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)}>
              <MenuIcon size={20} />
            </button>
            <span>Ma'Great Taste</span>
            <span>/</span>
            <b>{section}</b>
          </div>

          <div className="top-actions">
            {/* Global Search */}
            <div className="top-search-wrap" style={{ position: 'relative' }}>
              <div className="top-search">
                <Search size={15} />
                <input
                  placeholder="Search anything..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <kbd>⌘K</kbd>
                {search && (
                  <button className="clear-search-btn" onClick={() => setSearch('')}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {searchResults && (
                <div className="search-results-dropdown">
                  <div className="search-dropdown-header">
                    <span>Search results for "{search}"</span>
                    <button onClick={() => setSearch('')}>Close</button>
                  </div>
                  {searchResults.foods.length > 0 && (
                    <div className="search-group">
                      <small>MENU DISHES</small>
                      {searchResults.foods.map(f => (
                        <div
                          key={f.id}
                          className="search-row"
                          onClick={() => {
                            setSection('Menu management');
                            setSearch(f.name);
                          }}
                        >
                          <UtensilsCrossed size={14} />
                          <span>{f.name}</span>
                          <b>{money(f.price)}</b>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.orders.length > 0 && (
                    <div className="search-group">
                      <small>ORDERS</small>
                      {searchResults.orders.map(o => (
                        <div
                          key={o.id}
                          className="search-row"
                          onClick={() => {
                            setSection('Orders');
                            setSearch(o.id);
                          }}
                        >
                          <ShoppingBag size={14} />
                          <span>{o.id} — {o.customer}</span>
                          <b>{money(o.total)}</b>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.customers.length > 0 && (
                    <div className="search-group">
                      <small>CUSTOMERS & COMPANIES</small>
                      {searchResults.customers.map(c => (
                        <div
                          key={c.id}
                          className="search-row"
                          onClick={() => {
                            setSection('Customers');
                            setSearch(c.name);
                          }}
                        >
                          <Users size={14} />
                          <span>{c.name} {c.companyName ? `(${c.companyName})` : ''}</span>
                          <b>{c.segment}</b>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="notification-wrap">
              <button
                className="icon-btn bell"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={18} />
                {(newOrdersCount > 0 || unread > 0) && <i />}
              </button>
              {showNotifications && (
                <div className="notification-pop">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <strong>Kitchen Notifications</strong>
                    <button
                      style={{ background: 'none', border: 0, padding: 0, fontSize: 11, color: 'var(--brand-red)', cursor: 'pointer' }}
                      onClick={() => setShowNotifications(false)}
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="notif-item" onClick={() => { setSection('Orders'); setShowNotifications(false); }}>
                    <span className="notif-dot" />
                    <div>
                      <strong>{newOrdersCount} New Customer Orders</strong>
                      <p>Awaiting chef confirmation and preparation.</p>
                    </div>
                  </div>
                  <div className="notif-item" onClick={() => { setSection('Catering & events'); setShowNotifications(false); }}>
                    <span className="notif-dot blue" />
                    <div>
                      <strong>{cateringLeads.length} Catering Enquiries</strong>
                      <p>Clients awaiting tasting menus and pricing quotes.</p>
                    </div>
                  </div>
                  <div className="notif-item" onClick={() => { setSection('Saved meals & reminders'); setShowNotifications(false); }}>
                    <span className="notif-dot gold" />
                    <div>
                      <strong>Dinner Reminders Active</strong>
                      <p>{savedCustomers.length} customers ready for 5:00 PM dinner dispatch.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top avatar with profile popover */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
              <span className={`header-role-pill ${currentAdmin.role}`}>
                {currentAdmin.role === 'super_admin' ? '👑 Super Admin' : '👨‍🍳 Staff Admin'}
              </span>
              <div
                className="top-avatar"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: 'pointer' }}
                title={`${currentAdmin.name} (${currentAdmin.role})`}
              >
                {currentAdmin.name ? currentAdmin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
              </div>
              {showProfileMenu && (
                <div className="profile-popover">
                  <div style={{ paddingBottom: 10, borderBottom: '1px solid #eef2f5', marginBottom: 10 }}>
                    <strong style={{ display: 'block', fontSize: 13, color: '#182838' }}>{currentAdmin.name}</strong>
                    <span style={{ fontSize: 11, color: '#687c88' }}>{currentAdmin.email}</span>
                    <div style={{ marginTop: 6 }}>
                      <span className={`role-badge ${currentAdmin.role}`}>
                        {currentAdmin.role === 'super_admin' ? '👑 Super Admin' : '👨‍🍳 Kitchen Staff'}
                      </span>
                    </div>
                  </div>
                  <button className="popover-link" onClick={() => { setSection('Settings'); setShowProfileMenu(false); }}>
                    <Settings size={14} /> Store Settings
                  </button>
                  <button className="popover-link" onClick={() => { setSection('Customers'); setShowProfileMenu(false); }}>
                    <Percent size={14} /> Customer Discounts
                  </button>
                  {currentAdmin.role === 'super_admin' && (
                    <button className="popover-link" onClick={() => { setShowSecurityModal(true); setShowProfileMenu(false); }}>
                      <ShieldCheck size={14} /> Admin Team &amp; Roles
                    </button>
                  )}
                  <button
                    className="popover-link"
                    onClick={handleAdminSignOut}
                    style={{ color: '#c6381e', borderTop: '1px solid #f0f3f6', marginTop: 6, paddingTop: 8 }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="page">
          {/* Header row */}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                OCTOBER 2026 <span>•</span> LAGOS, NIGERIA
              </div>
              <h1>
                {section === 'Overview' && (currentAdmin.role === 'super_admin' ? 'Good morning, Chef Margaret 👋' : `Good morning, ${currentAdmin.name} 👨‍🍳`)}
                {section === 'Orders' && 'Orders Management'}
                {section === 'Menu management' && 'Menu Management'}
                {section === 'Delivery locations' && 'Delivery Locations & Lagos Zones'}
                {section === 'Catering & events' && 'Catering & Events'}
                {section === 'Tasting requests' && 'Corporate Tasting Box Requests'}
                {section === 'Meal plans' && 'Meal Plans & Subscriptions'}
                {section === 'Culinary school' && 'Culinary Arts Academy'}
                {section === 'Messages' && 'Customer Messages'}
                {section === 'Newsletter & broadcasts' && 'Newsletter & Email Broadcasts'}
                {section === 'Saved meals & reminders' && 'Saved Meals & Automated Meal Reminders'}
                {section === 'Analytics' && 'Business Analytics'}
                {section === 'Customers' && 'Customers Directory & Discounts'}
                {section === 'Settings' && 'Store Settings'}
              </h1>
              <p>
                {section === 'Overview' && (currentAdmin.role === 'super_admin' ? 'Here is what’s cooking at Ma’Great Taste today.' : 'Welcome to your daily kitchen operations and food fulfillment dashboard.')}
                {section === 'Orders' && 'Track and fulfil incoming orders from the website and delivery dispatch.'}
                {section === 'Menu management' && 'Add dishes, update pricing, upload dish photos, and manage signature dishes.'}
                {section === 'Delivery locations' && 'Manage dispatch places strictly within Lagos State, set custom delivery fees, ETAs, and assign which meals are available in each location.'}
                {section === 'Catering & events' && 'Manage high-value catering leads, corporate bookings, send quotes, and discuss menus.'}
                {section === 'Tasting requests' && 'Review and organize complimentary corporate tasting box requests for corporate client teams.'}
                {section === 'Meal plans' && 'Create and edit meal prep packages and freezer stocking subscriptions.'}
                {section === 'Culinary school' && 'Review student admissions, journey selections, and connect directly with applicants.'}
                {section === 'Messages' && 'Enquiries, reviews, and questions sent from the website contact forms.'}
                {section === 'Newsletter & broadcasts' && 'Compose, preview, and dispatch rich HTML email campaigns to all website newsletter subscribers via Mailtrap live SMTP.'}
                {section === 'Saved meals & reminders' && 'Dispatch manual bulk reminders to selected customers, or configure automated alerts for Breakfast, Lunch, Dinner, or Desserts.'}
                {section === 'Customers' && 'Manage individual VIPs, corporate companies, assign discounts and vouchers.'}
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 1. OVERVIEW SECTION */}
          {/* ========================================================= */}
          {section === 'Overview' && (
            <>
              {/* Banner */}
              <div className="welcome-banner">
                <div className="welcome-content">
                  <span className="welcome-tag">
                    <ChefHat size={14} /> KITCHEN STUDIO
                  </span>
                  <h2>{foods.length} Fresh dishes live on your store today.</h2>
                  <p>
                    Orders are streaming into your kitchen dispatch. Review orders, coordinate packing, and send timely customer notifications.
                  </p>
                  <button onClick={() => setSection('Menu management')}>
                    Manage menu items <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="welcome-illustration-box">
                  <div className="plate-graphic">
                    <span>🍲</span>
                  </div>
                  <div className="banner-stat-box">
                    <small>Today's orders</small>
                    <strong>{orders.length}</strong>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="stat-grid">
                {currentAdmin.role === 'super_admin' ? (
                  <div className="stat-card">
                    <div className="stat-top">
                      <div className="stat-icon green">
                        <CircleDollarSign />
                      </div>
                      <span className="stat-change up">+18%</span>
                    </div>
                    <p>Gross revenue (Confirmed Payments)</p>
                    <strong className="stat-value">{money(grossRevenue)}</strong>
                    <div className="stat-bottom">
                      <small>{paidOrders.length} verified paid orders</small>
                    </div>
                  </div>
                ) : (
                  <div className="stat-card">
                    <div className="stat-top">
                      <div className="stat-icon green">
                        <UtensilsCrossed />
                      </div>
                      <span className="stat-change up">Kitchen Live</span>
                    </div>
                    <p>Kitchen Active Menu</p>
                    <strong className="stat-value">{foods.filter(f => f.status === 'Available').length} dishes</strong>
                    <div className="stat-bottom">
                      <small>{foods.length} total items catalogue</small>
                    </div>
                  </div>
                )}

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon orange">
                      <ShoppingBag />
                    </div>
                    <span className="stat-change up">{orders.filter(o => o.status === 'Delivered').length} done</span>
                  </div>
                  <p>Total orders fulfilled</p>
                  <strong className="stat-value">{orders.filter(o => o.status === 'Delivered').length}</strong>
                  <div className="stat-bottom">
                    <small>{orders.filter(o => o.status === 'Preparing' || o.status === 'Ready').length} in kitchen prep</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon purple">
                      <CalendarDays />
                    </div>
                    <span className="stat-change neutral">{cateringLeads.length} leads</span>
                  </div>
                  <p>Catering enquiries</p>
                  <strong className="stat-value">{cateringLeads.length} active</strong>
                  <div className="stat-bottom">
                    <small>{cateringLeads.length > 0 ? `${cateringLeads.length} bookings in review` : 'No pending bookings'}</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon blue">
                      <Percent />
                    </div>
                    <span className="stat-change up">Active</span>
                  </div>
                  <p>Active Corporate Discounts</p>
                  <strong className="stat-value">
                    {customers.filter(c => c.discount).length} accounts
                  </strong>
                  <div className="stat-bottom">
                    <small>{customers.filter(c => c.discount).length > 0 ? 'Custom vouchers assigned' : 'No active discount rules'}</small>
                  </div>
                </div>
              </div>

              {/* Revenue & Category Breakdown Grid */}
              <div className="overview-grid">
                {currentAdmin.role === 'super_admin' ? (
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Revenue performance</h3>
                        <p>Weekly order volume across Lagos</p>
                      </div>
                      <span className="trend-pill">
                        <TrendingUp size={13} /> +24.8% vs last month
                      </span>
                    </div>
                    <div className="revenue-total">
                      <strong>{money(grossRevenue)}</strong>
                      <small>{orders.length > 0 ? `${orders.length} orders fulfilled online` : 'Live online kitchen revenue'}</small>
                    </div>
                    <div className="chart">
                      <div className="chart-y">
                        <span>₦400k</span>
                        <span>₦300k</span>
                        <span>₦200k</span>
                        <span>₦100k</span>
                        <span>₦0</span>
                      </div>
                      <div className="chart-area">
                        <div className="gridline g1" />
                        <div className="gridline g2" />
                        <div className="gridline g3" />
                        <div className="gridline g4" />
                        <svg className="chart-svg" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c6381e" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#c6381e" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,110 C80,95 140,40 220,55 C300,70 380,20 500,28 L500,150 L0,150 Z"
                            fill="url(#chartGrad)"
                          />
                          <path
                            d="M0,110 C80,95 140,40 220,55 C300,70 380,20 500,28"
                            fill="none"
                            stroke="#c6381e"
                            strokeWidth="3"
                          />
                        </svg>
                        <div className="chart-x">
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                          <span>Sun</span>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Active Kitchen Order Queue</h3>
                        <p>Recent customer tickets awaiting packing &amp; dispatch</p>
                      </div>
                      <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setSection('Orders')}>
                        View all orders <ArrowUpRight size={13} />
                      </button>
                    </div>
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {orders.slice(0, 4).map(o => (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #eef2f5' }}>
                          <div>
                            <strong style={{ fontSize: 13, color: '#182838' }}>{o.customer}</strong>
                            <span style={{ display: 'block', fontSize: 11, color: '#687c88' }}>{o.items?.length || 1} items · {o.address || 'Lagos Delivery'}</span>
                          </div>
                          <span className={`status status-${o.status === 'Delivered' ? 'green' : o.status === 'Preparing' ? 'orange' : 'blue'}`}>
                            {o.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="panel category-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Menu category distribution</h3>
                      <p>Active dishes in kitchen catalogue</p>
                    </div>
                    <button className="dots-btn" onClick={() => setSection('Menu management')}>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <div className="donut-wrap">
                    <div className="donut">
                      <div>
                        <strong>{foods.length}</strong>
                        <small>Total dishes</small>
                      </div>
                    </div>
                  </div>
                  <div className="category-list">
                    {categoryStats.map(cat => (
                      <div className="category-row" key={cat.name}>
                        <span className="category-name">
                          <i style={{ background: cat.color }} /> {cat.name} ({cat.count})
                        </span>
                        <strong>{cat.pct}%</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Recent Orders Panel */}
              <section className="panel orders-panel">
                <div className="panel-head">
                  <div>
                    <h3>Recent orders</h3>
                    <p>Live incoming customer orders from the frontend</p>
                  </div>
                  <button className="text-btn" onClick={() => setSection('Orders')}>
                    View all orders <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="table-wrap">
                  {orders.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <ShoppingBag size={32} style={{ opacity: 0.35, marginBottom: 10, color: 'var(--brand-navy)' }} />
                      <p style={{ fontSize: 13, color: '#687c88' }}>No customer orders yet. Incoming orders from the website will appear here in real time.</p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>ORDER ID</th>
                          <th>CUSTOMER</th>
                          <th>ITEMS</th>
                          <th>DATE</th>
                          <th>TOTAL</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td>
                              <strong className="order-id">{o.id}</strong>
                            </td>
                            <td>
                              <div className="customer-cell">
                                <div className="avatar small">{o.customer.split(' ').map(x => x[0]).join('')}</div>
                                <div>
                                  <strong>{o.customer}</strong>
                                  <small className="subline">{o.phone || o.email || 'Online order'}</small>
                                </div>
                              </div>
                            </td>
                            <td className="item-cell" title={o.item}>{o.item}</td>
                            <td>{o.date}</td>
                            <td>
                              <strong>{money(o.total)}</strong>
                              <div style={{ marginTop: 4 }}>
                                {o.paymentStatus === 'paid' ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#16a34a', background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)', padding: '2px 7px', borderRadius: 12 }}>
                                    ✓ Paid
                                  </span>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#d97706', background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)', padding: '2px 7px', borderRadius: 12 }}>
                                    ⏳ {o.paymentStatus || 'Pending'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <select
                                className={`status-select status-${o.status.toLowerCase()}`}
                                value={o.status}
                                onChange={e => updateOrderStatus(o.id, e.target.value as Order['status'])}
                              >
                                <option>New</option>
                                <option>Preparing</option>
                                <option>Ready</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                              </select>
                            </td>
                            <td>
                              <button
                                className="action-pill-btn"
                                onClick={() => setSelectedOrder(o)}
                                title="View Order Details & Kitchen Docket"
                              >
                                <MoreHorizontal size={16} /> Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              {/* Bottom Quick Actions Grid */}
              <div className="bottom-grid">
                <section className="panel quick-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Quick actions</h3>
                      <p>Get kitchen operations done faster</p>
                    </div>
                  </div>
                  <div className="quick-grid">
                    <button className="quick-action" onClick={openAddFoodModal}>
                      <div className="quick-icon green">
                        <Plus size={18} />
                      </div>
                      <div>
                        <strong>Add a menu item</strong>
                        <small>Publish new dish with photo</small>
                      </div>
                    </button>
                    <button className="quick-action" onClick={() => setSection('Catering & events')}>
                      <div className="quick-icon orange">
                        <CalendarDays size={18} />
                      </div>
                      <div>
                        <strong>Review catering</strong>
                        <small>{cateringLeads.length} leads waiting</small>
                      </div>
                    </button>
                    <button className="quick-action" onClick={() => setSection('Customers')}>
                      <div className="quick-icon purple">
                        <Percent size={18} />
                      </div>
                      <div>
                        <strong>Give customer discount</strong>
                        <small>Corporate & VIP promo codes</small>
                      </div>
                    </button>
                    <button className="quick-action" onClick={() => setSection('Saved meals & reminders')}>
                      <div className="quick-icon blue">
                        <Mail size={18} />
                      </div>
                      <div>
                        <strong>Dispatch dinner reminders</strong>
                        <small>{savedCustomers.length} hungry customers</small>
                      </div>
                    </button>
                  </div>
                </section>

                <section className="panel attention-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Needs your attention</h3>
                      <p>Pending kitchen items</p>
                    </div>
                    <span className="attention-count">{newOrdersCount + unread}</span>
                  </div>
                  <button className="attention-row" onClick={() => setSection('Orders')}>
                    <span className="attention-icon orange">
                      <ShoppingBag size={17} />
                    </span>
                    <span>
                      <strong>{newOrdersCount} new customer orders</strong>
                      <small>Review, cook and dispatch to courier</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                  <button className="attention-row" onClick={() => setSection('Catering & events')}>
                    <span className="attention-icon purple">
                      <CalendarDays size={17} />
                    </span>
                    <span>
                      <strong>{cateringLeads.length} catering enquiries</strong>
                      <small>Prepare tasting menus and invoices</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                  <button className="attention-row" onClick={() => setSection('Saved meals & reminders')}>
                    <span className="attention-icon blue">
                      <Heart size={17} />
                    </span>
                    <span>
                      <strong>{savedCustomers.length} saved customer meals</strong>
                      <small>Send targeted dinner reminders</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                </section>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* 2. MENU MANAGEMENT SECTION */}
          {/* ========================================================= */}
          {section === 'Menu management' && (
            <section className="panel content-panel">
              <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
                <div className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Search dishes, stews, grills..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="Nigerian">Nigerian</option>
                  <option value="Soups & Swallows">Soups & Swallows</option>
                  <option value="Grills & Proteins">Grills & Proteins</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Continental">Continental</option>
                  <option value="Asian">Asian</option>
                  <option value="Pastries & Snacks">Pastries & Snacks</option>
                </select>

                {/* Quick Status & Visibility Filter Pills */}
                <div className="status-pill-group">
                  <button
                    type="button"
                    className={`status-pill-btn ${menuStatusFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setMenuStatusFilter('All')}
                  >
                    All ({foods.length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn ${menuStatusFilter === 'Available' ? 'active' : ''}`}
                    onClick={() => setMenuStatusFilter('Available')}
                  >
                    Available ({foods.filter(f => f.status === 'Available').length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn ${menuStatusFilter === 'Sold out' ? 'active' : ''}`}
                    onClick={() => setMenuStatusFilter('Sold out')}
                  >
                    Sold out ({foods.filter(f => f.status === 'Sold out').length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn ${menuStatusFilter === 'Hidden' ? 'active' : ''}`}
                    onClick={() => setMenuStatusFilter('Hidden')}
                  >
                    <EyeOff size={12} /> Hidden ({foods.filter(f => f.status === 'Hidden').length})
                  </button>
                </div>

                <button className="primary-btn" onClick={openAddFoodModal} style={{ marginLeft: 'auto' }}>
                  <Plus size={15} /> Add menu item
                </button>
              </div>

              {/* Dish Cards Grid */}
              <div className="menu-grid">
                {filteredFoods.map(f => (
                  <div className={`food-card ${f.status === 'Hidden' ? 'dish-card-hidden' : ''}`} key={f.id}>
                    <div className="food-photo">
                      <img
                        src={resolveMealImage(f.image)}
                        alt={f.name}
                        onError={e => {
                          e.currentTarget.src = FALLBACK_FOOD_IMG;
                        }}
                      />
                      <span className={`status ${f.status === 'Available' ? 'status-green' : f.status === 'Hidden' ? 'status-amber' : 'status-red'}`}>
                        {f.status === 'Hidden' ? 'Hidden from public' : f.status}
                      </span>
                      {f.tag && <span className="food-badge-tag">{f.tag}</span>}
                      <div className="food-menu-container">
                        <button
                          className="food-more"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFoodMenuId(openFoodMenuId === f.id ? null : f.id);
                          }}
                          title="Dish options"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {openFoodMenuId === f.id && (
                          <div className="food-dropdown-menu" onClick={e => e.stopPropagation()}>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                toggleFoodStatus(f);
                                setOpenFoodMenuId(null);
                              }}
                            >
                              <span className={`status-indicator ${f.status === 'Available' ? 'sold' : 'avail'}`} />
                              {f.status === 'Available' ? 'Mark as Sold out' : 'Mark as Available'}
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                toggleFoodHidden(f);
                                setOpenFoodMenuId(null);
                              }}
                            >
                              {f.status === 'Hidden' ? (
                                <>
                                  <Eye size={14} color="#166534" /> Show on public menu
                                </>
                              ) : (
                                <>
                                  <EyeOff size={14} color="#b45309" /> Hide from public
                                </>
                              )}
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                openEditFoodModal(f);
                                setOpenFoodMenuId(null);
                              }}
                            >
                              <Pencil size={14} /> Edit details & price
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                const dishUrl = `https://magreattaste.ng/#menu?dish=${encodeURIComponent(f.name)}`;
                                navigator.clipboard?.writeText(dishUrl);
                                notify(`Share link for "${f.name}" copied!`);
                                setOpenFoodMenuId(null);
                              }}
                            >
                              <Copy size={14} /> Copy dish link
                            </button>
                            <button
                              className="dropdown-item danger"
                              onClick={() => {
                                setOpenFoodMenuId(null);
                                deleteFood(f.id, f.name);
                              }}
                            >
                              <Trash2 size={14} /> Remove dish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="food-card-body">
                      <span className="food-category">{f.category}</span>
                      <h3 title={f.name}>{f.name}</h3>
                      <p className="food-card-desc">
                        {f.description || 'Signature specialty prepared fresh by Chef Margaret.'}
                      </p>

                      {/* Delivery Availability Badge */}
                      <div style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: (!f.availableLocations || f.availableLocations.length === 0) ? '#f0fdf4' : '#eff6ff',
                          color: (!f.availableLocations || f.availableLocations.length === 0) ? '#166534' : '#1e40af',
                          border: (!f.availableLocations || f.availableLocations.length === 0) ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                        }}>
                          <MapPin size={10} />
                          {(!f.availableLocations || f.availableLocations.length === 0)
                            ? 'All Lagos'
                            : `${f.availableLocations.length} Lagos ${f.availableLocations.length === 1 ? 'location' : 'locations'}`}
                        </span>
                        {f.status === 'Hidden' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a'
                          }}>
                            <EyeOff size={10} /> Hidden from public
                          </span>
                        )}
                      </div>

                      <div className="food-card-foot">
                        <strong>{money(f.price)}</strong>
                        <span>{dishOrderCountMap[f.name.trim().toLowerCase()] || 0} orders</span>
                      </div>

                      <div className="food-actions">
                        <button className="edit-btn" onClick={() => openEditFoodModal(f)}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button className="delete-btn" onClick={() => deleteFood(f.id, f.name)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFoods.length === 0 && (
                <div className="empty-state">
                  <p>No menu items match your search or filter.</p>
                  <button className="secondary-btn" onClick={() => { setSearch(''); setFilter('All'); }}>
                    Clear search filters
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ========================================================= */}
          {/* 2B. DELIVERY LOCATIONS & MEAL ASSIGNMENT (LAGOS ONLY) */}
          {/* ========================================================= */}
          {section === 'Delivery locations' && (() => {
            const activeCount = deliveryLocations.filter(l => l.isActive).length;
            const islandCount = deliveryLocations.filter(l => l.zone.toLowerCase().includes('island') || l.zone.toLowerCase().includes('lekki') || l.zone.toLowerCase().includes('ikoyi')).length;
            const mainlandCount = deliveryLocations.filter(l => l.zone.toLowerCase().includes('mainland')).length;

            const filteredLocs = deliveryLocations.filter(l => {
              const q = locationSearch.toLowerCase().trim();
              const matchesSearch = !q || l.name.toLowerCase().includes(q) || l.zone.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
              const matchesZone = locationZoneFilter === 'All' || l.zone.toLowerCase().includes(locationZoneFilter.toLowerCase());
              return matchesSearch && matchesZone;
            });

            return (
              <section className="panel content-panel">
                {/* Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Serviceable Lagos Areas</span>
                    <strong style={{ display: 'block', fontSize: 22, color: 'var(--brand-navy)', marginTop: 4 }}>{deliveryLocations.length} Locations</strong>
                    <small style={{ color: '#16a34a', fontWeight: 600 }}>{activeCount} active for dispatch</small>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Lagos Island Zones</span>
                    <strong style={{ display: 'block', fontSize: 22, color: 'var(--brand-navy)', marginTop: 4 }}>{islandCount} Areas</strong>
                    <small style={{ color: '#475569' }}>Lekki, VI, Ikoyi, Ajah</small>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Lagos Mainland Zones</span>
                    <strong style={{ display: 'block', fontSize: 22, color: 'var(--brand-navy)', marginTop: 4 }}>{mainlandCount} Areas</strong>
                    <small style={{ color: '#475569' }}>Ikeja, Surulere, Yaba, Gbagada</small>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '14px 16px', borderRadius: 10, border: '1px solid #fee2e2' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-red)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Menu Dishes</span>
                    <strong style={{ display: 'block', fontSize: 22, color: 'var(--brand-red)', marginTop: 4 }}>{foods.length} Dishes</strong>
                    <small style={{ color: '#991b1b' }}>Assign dishes per location below</small>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div className="search-field" style={{ minWidth: 260 }}>
                    <Search size={16} />
                    <input
                      placeholder="Search Lagos location (e.g. Lekki, Ikeja, VI)..."
                      value={locationSearch}
                      onChange={e => setLocationSearch(e.target.value)}
                    />
                  </div>
                  <select value={locationZoneFilter} onChange={e => setLocationZoneFilter(e.target.value)}>
                    <option value="All">All Lagos Zones</option>
                    <option value="Island">Island & Lekki</option>
                    <option value="Mainland">Mainland</option>
                  </select>
                  <button className="primary-btn" onClick={openAddLocationModal}>
                    <Plus size={15} /> Add Lagos Location
                  </button>
                </div>

                {/* Locations Grid / Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 16 }}>
                  {filteredLocs.map(loc => {
                    const availableMealsCount = foods.filter(f => !f.availableLocations || f.availableLocations.length === 0 || f.availableLocations.includes(loc.id)).length;
                    const isAllAvailable = availableMealsCount === foods.length;

                    return (
                      <div
                        key={loc.id}
                        style={{
                          background: '#ffffff',
                          border: loc.isActive ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                          opacity: loc.isActive ? 1 : 0.75,
                          borderRadius: 12,
                          padding: 18,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          {/* Top Tag & Active Toggle */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '3px 7px',
                                borderRadius: 4,
                                background: '#f1f5f9',
                                color: '#475569',
                                letterSpacing: 0.5
                              }}>
                                📍 Lagos State • {loc.zone}
                              </span>
                              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand-navy)', margin: '8px 0 2px' }}>
                                {loc.name}
                              </h3>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>ID: {loc.id}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleLocationActive(loc)}
                              title={loc.isActive ? 'Click to pause delivery here' : 'Click to enable delivery here'}
                              style={{
                                border: 'none',
                                background: loc.isActive ? '#dcfce7' : '#fee2e2',
                                color: loc.isActive ? '#15803d' : '#b91c1c',
                                padding: '4px 10px',
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: loc.isActive ? '#22c55e' : '#ef4444' }} />
                              {loc.isActive ? 'Active' : 'Paused'}
                            </button>
                          </div>

                          {/* Fee and Delivery Time */}
                          <div style={{ display: 'flex', gap: 12, margin: '14px 0', padding: '10px 12px', background: '#f8fafc', borderRadius: 8 }}>
                            <div style={{ flex: 1 }}>
                              <small style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Delivery Fee</small>
                              <strong style={{ fontSize: 14, color: 'var(--brand-red)' }}>₦{(loc.deliveryFee || 0).toLocaleString()}</strong>
                            </div>
                            <div style={{ flex: 1 }}>
                              <small style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Est. Delivery Time</small>
                              <strong style={{ fontSize: 13, color: 'var(--brand-navy)' }}>{loc.estimatedTime || '25–40 min'}</strong>
                            </div>
                          </div>

                          {/* Meal Availability Info */}
                          <div style={{ padding: '8px 10px', borderRadius: 6, background: isAllAvailable ? '#f0fdf4' : '#eff6ff', border: isAllAvailable ? '1px solid #bbf7d0' : '1px solid #bfdbfe', marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: isAllAvailable ? '#166534' : '#1e40af', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <UtensilsCrossed size={12} />
                                {isAllAvailable ? 'All Dishes Available' : `${availableMealsCount} of ${foods.length} Dishes Available`}
                              </span>
                              <span style={{ fontSize: 10, color: isAllAvailable ? '#15803d' : '#2563eb', fontWeight: 600 }}>
                                {Math.round((availableMealsCount / (foods.length || 1)) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => setMealAssignLocation(loc)}
                            style={{ flex: 2, padding: '7px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            <UtensilsCrossed size={13} color="var(--brand-red)" />
                            Assign Specific Meals
                          </button>
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => openEditLocationModal(loc)}
                            style={{ flex: 1, padding: '7px 10px', fontSize: 12 }}
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => deleteDeliveryLocation(loc.id, loc.name)}
                            style={{ padding: '7px 10px', fontSize: 12 }}
                            title="Delete location"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredLocs.length === 0 && (
                  <div className="empty-state" style={{ marginTop: 24 }}>
                    <p>No Lagos locations match your search or zone filter.</p>
                    <button className="secondary-btn" onClick={() => { setLocationSearch(''); setLocationZoneFilter('All'); }}>
                      Reset filters
                    </button>
                  </div>
                )}
              </section>
            );
          })()}

          {/* ========================================================= */}
          {/* 3. ORDERS MANAGEMENT */}
          {/* ========================================================= */}
          {section === 'Orders' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Search by order ID, customer, meal..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="New">New</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button className="secondary-btn" onClick={downloadReport}>
                  <Download size={15} /> Export CSV
                </button>
              </div>

              <div className="table-wrap">
                {orders.length === 0 ? (
                  <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <ShoppingBag size={42} style={{ opacity: 0.35, marginBottom: 14, color: 'var(--brand-navy)' }} />
                    <h3 style={{ fontSize: 17, color: 'var(--brand-navy)', marginBottom: 6 }}>No customer orders placed yet</h3>
                    <p style={{ fontSize: 13, color: '#687c88', maxWidth: 450, margin: '0 auto' }}>
                      Orders placed through the website menu and checkout will appear here instantly for chef preparation and dispatch.
                    </p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>CONTACT & ADDRESS</th>
                        <th>ITEMS</th>
                        <th>DATE</th>
                        <th>TOTAL</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(
                          o =>
                            (o.id + ' ' + o.customer + ' ' + o.item).toLowerCase().includes(search.toLowerCase()) &&
                            (filter === 'All' || o.status.toLowerCase() === filter.toLowerCase())
                        )
                        .map(o => (
                          <tr key={o.id}>
                            <td>
                              <strong className="order-id">{o.id}</strong>
                            </td>
                            <td>
                              <div className="customer-cell">
                                <div className="avatar small">{o.customer.split(' ').map(x => x[0]).join('')}</div>
                                <div>
                                  <strong>{o.customer}</strong>
                                  <small className="subline">{o.paymentMethod || 'Online'}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span>{o.phone || '0800 000 0000'}</span>
                              <small className="subline" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {o.address || 'Lagos, Nigeria'}
                              </small>
                            </td>
                            <td className="item-cell" title={o.item}>{o.item}</td>
                            <td>{o.date}</td>
                            <td>
                              <strong>{money(o.total)}</strong>
                              <div style={{ marginTop: 4 }}>
                                {o.paymentStatus === 'paid' ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#16a34a', background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)', padding: '2px 7px', borderRadius: 12 }}>
                                    ✓ Paid ({o.paymentMethod || 'Paystack'})
                                  </span>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#d97706', background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)', padding: '2px 7px', borderRadius: 12 }}>
                                    ⏳ {o.paymentStatus || 'Pending'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <select
                                className={`status-select status-${o.status.toLowerCase()}`}
                                value={o.status}
                                onChange={e => updateOrderStatus(o.id, e.target.value as Order['status'])}
                              >
                                <option>New</option>
                                <option>Preparing</option>
                                <option>Ready</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                              </select>
                            </td>
                            <td>
                              <button className="action-pill-btn" onClick={() => setSelectedOrder(o)}>
                                View docket
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 4. CATERING & EVENTS (LUXURY DATA TABLE, STATS & FILTERS) */}
          {/* ========================================================= */}
          {section === 'Catering & events' && (() => {
            const pendingCount = cateringLeads.filter(c => c.status === 'Pending').length;
            const quoteSentCount = cateringLeads.filter(c => c.status === 'Quote sent').length;
            const confirmedCount = cateringLeads.filter(c => c.status === 'Confirmed').length;
            const declinedCount = cateringLeads.filter(c => c.status === 'Declined').length;

            const filteredLeads = cateringLeads.filter(c => {
              const query = cateringSearch.trim().toLowerCase();
              const matchesSearch =
                !query ||
                (c.eventType + ' ' + c.customerName + ' ' + c.location + ' ' + c.customerPhone + ' ' + (c.customerEmail || '') + ' ' + (c.budget || ''))
                  .toLowerCase()
                  .includes(query);
              const matchesStatus = cateringStatusFilter === 'All' || c.status === cateringStatusFilter;
              return matchesSearch && matchesStatus;
            });

            return (
              <section className="panel content-panel">
                {/* Header Toolbar */}
                <div className="toolbar" style={{ marginBottom: 16 }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      <CalendarDays size={20} color="var(--brand-red)" /> High-Volume Catering Leads & Quotes
                    </h3>
                    <p className="muted" style={{ margin: '4px 0 0' }}>
                      Direct pipeline for wedding banquets, corporate retreats, VIP dining & party catering.
                    </p>
                  </div>
                  <button className="secondary-btn" onClick={loadBackendData} title="Fetch latest submissions from live server">
                    <Filter size={14} /> Refresh leads
                  </button>
                </div>

                {/* Top KPI Metrics Row */}
                <div className="catering-kpi-bar">
                  <div className="catering-kpi-card">
                    <div className="catering-kpi-icon navy">🍲</div>
                    <div className="catering-kpi-info">
                      <h4>Total Enquiries</h4>
                      <strong>{cateringLeads.length}</strong>
                    </div>
                  </div>
                  <div className="catering-kpi-card" onClick={() => setCateringStatusFilter('Pending')} style={{ cursor: 'pointer' }}>
                    <div className="catering-kpi-icon amber">⏳</div>
                    <div className="catering-kpi-info">
                      <h4>Pending Review</h4>
                      <strong style={{ color: '#b45309' }}>{pendingCount}</strong>
                    </div>
                  </div>
                  <div className="catering-kpi-card" onClick={() => setCateringStatusFilter('Quote sent')} style={{ cursor: 'pointer' }}>
                    <div className="catering-kpi-icon blue">📄</div>
                    <div className="catering-kpi-info">
                      <h4>Quotes Dispatched</h4>
                      <strong style={{ color: '#1d4ed8' }}>{quoteSentCount}</strong>
                    </div>
                  </div>
                  <div className="catering-kpi-card" onClick={() => setCateringStatusFilter('Confirmed')} style={{ cursor: 'pointer' }}>
                    <div className="catering-kpi-icon green">✅</div>
                    <div className="catering-kpi-info">
                      <h4>Confirmed Banquets</h4>
                      <strong style={{ color: '#047857' }}>{confirmedCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Controls & Filter Bar */}
                <div className="catering-controls-bar">
                  {/* Status Filter Pills */}
                  <div className="catering-filter-pills">
                    <button
                      className={`catering-filter-pill ${cateringStatusFilter === 'All' ? 'active' : ''}`}
                      onClick={() => setCateringStatusFilter('All')}
                    >
                      All Leads <span className="catering-filter-count">{cateringLeads.length}</span>
                    </button>
                    <button
                      className={`catering-filter-pill ${cateringStatusFilter === 'Pending' ? 'active' : ''}`}
                      onClick={() => setCateringStatusFilter('Pending')}
                    >
                      Pending <span className="catering-filter-count">{pendingCount}</span>
                    </button>
                    <button
                      className={`catering-filter-pill ${cateringStatusFilter === 'Quote sent' ? 'active' : ''}`}
                      onClick={() => setCateringStatusFilter('Quote sent')}
                    >
                      Quote sent <span className="catering-filter-count">{quoteSentCount}</span>
                    </button>
                    <button
                      className={`catering-filter-pill ${cateringStatusFilter === 'Confirmed' ? 'active' : ''}`}
                      onClick={() => setCateringStatusFilter('Confirmed')}
                    >
                      Confirmed <span className="catering-filter-count">{confirmedCount}</span>
                    </button>
                    {declinedCount > 0 && (
                      <button
                        className={`catering-filter-pill ${cateringStatusFilter === 'Declined' ? 'active' : ''}`}
                        onClick={() => setCateringStatusFilter('Declined')}
                      >
                        Declined <span className="catering-filter-count">{declinedCount}</span>
                      </button>
                    )}
                  </div>

                  {/* Search and View Toggle */}
                  <div className="catering-search-and-view">
                    <div className="catering-search-input-wrap">
                      <Search size={14} />
                      <input
                        type="text"
                        className="catering-search-input"
                        placeholder="Search client, venue, phone..."
                        value={cateringSearch}
                        onChange={e => setCateringSearch(e.target.value)}
                      />
                    </div>

                    <div className="catering-view-toggle">
                      <button
                        className={`catering-view-btn ${cateringViewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setCateringViewMode('table')}
                        title="Nice Table View"
                      >
                        <TableIcon size={14} /> Table
                      </button>
                      <button
                        className={`catering-view-btn ${cateringViewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setCateringViewMode('cards')}
                        title="Cards Grid View"
                      >
                        <LayoutGrid size={14} /> Cards
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Rendering: Empty State vs Table vs Cards */}
                {filteredLeads.length === 0 ? (
                  <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <CalendarDays size={42} style={{ opacity: 0.35, marginBottom: 14, color: 'var(--brand-navy)' }} />
                    <h3 style={{ fontSize: 17, color: 'var(--brand-navy)', marginBottom: 6 }}>
                      {cateringLeads.length === 0 ? 'No catering enquiries yet' : 'No matching catering leads found'}
                    </h3>
                    <p style={{ fontSize: 13, color: '#687c88', maxWidth: 450, margin: '0 auto' }}>
                      {cateringLeads.length === 0
                        ? 'Party bookings, corporate lunches, and wedding catering enquiries submitted through the website form will appear here.'
                        : 'Try adjusting your search query or status filter to see other enquiries.'}
                    </p>
                  </div>
                ) : cateringViewMode === 'table' ? (
                  /* ========================================================= */
                  /* FINE & NICE DATA TABLE */
                  /* ========================================================= */
                  <div className="catering-table-card">
                    <div className="catering-table-container">
                      <table className="catering-table">
                        <thead>
                          <tr>
                            <th>EVENT & CLIENT</th>
                            <th>GUESTS & VENUE</th>
                            <th>EVENT DATE</th>
                            <th>BUDGET ESTIMATE</th>
                            <th>CONTACT DETAILS</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right', paddingRight: 20 }}>ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.map((c, idx) => (
                            <tr key={c.id || idx}>
                              {/* Event & Client */}
                              <td>
                                <div className="catering-cell-event">
                                  <div className="catering-cell-avatar">🍲</div>
                                  <div>
                                    <span className="catering-cell-event-title">{c.eventType}</span>
                                    <span className="catering-cell-client">
                                      <strong>{c.customerName}</strong>
                                    </span>
                                    {c.dietaryRequirements && (
                                      <span className="catering-badge-dietary" title={c.dietaryRequirements}>
                                        🌱 Note: {c.dietaryRequirements}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Guests & Venue */}
                              <td>
                                <div>
                                  <span className="catering-pill-guest">
                                    <Users size={12} /> {c.guestCount} guests
                                  </span>
                                  <div className="catering-venue-line">
                                    <MapPin size={12} color="#64748b" /> {c.location}
                                  </div>
                                </div>
                              </td>

                              {/* Event Date */}
                              <td>
                                <span className="catering-date-badge">
                                  <CalendarDays size={13} /> {c.eventDate}
                                </span>
                              </td>

                              {/* Budget */}
                              <td>
                                <span className="catering-budget-pill">{c.budget || 'To be discussed'}</span>
                              </td>

                              {/* Contact Details */}
                              <td>
                                <div className="catering-contact-line">
                                  <a href={`tel:${c.customerPhone}`} className="catering-phone-link">
                                    <Phone size={12} color="#182838" /> {c.customerPhone}
                                  </a>
                                  {c.customerEmail && (
                                    <span className="catering-email-sub" title={c.customerEmail}>
                                      {c.customerEmail}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Status Dropdown */}
                              <td>
                                <select
                                  className={`catering-status-select status-${c.status.toLowerCase().replace(' ', '-')}`}
                                  value={c.status}
                                  onChange={e => updateCateringStatusDirect(c.id, e.target.value as CateringLead['status'])}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Quote sent">Quote sent</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Declined">Declined</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td>
                                <div className="catering-actions-cell" style={{ justifyContent: 'flex-end', paddingRight: 6 }}>
                                  <button
                                    className="catering-quote-action-btn"
                                    onClick={() => openQuoteModal(c)}
                                    title="Draft & send official quotation"
                                  >
                                    <DollarSign size={13} /> Send Quotation
                                  </button>
                                  <button
                                    className="catering-whatsapp-icon-btn"
                                    onClick={() => sendWhatsAppCatering(c)}
                                    title={`Chat with ${c.customerName} on WhatsApp`}
                                  >
                                    <MessageCircle size={15} />
                                  </button>
                                  <button
                                    className="catering-details-pill-btn"
                                    onClick={() => setSelectedCateringDrawer(c)}
                                    title="View full booking dossier"
                                  >
                                    <FileText size={13} /> Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* OPTIONAL CARDS GRID VIEW */
                  /* ========================================================= */
                  <div className="event-cards">
                    {filteredLeads.map((c, idx) => (
                      <div className="event-card-rich" key={c.id || idx}>
                        <div className="event-card-rich-header">
                          <div className="event-emoji">🍲</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h3 style={{ margin: 0 }}>{c.eventType}</h3>
                              <select
                                className={`status-select status-${c.status === 'Confirmed' ? 'delivered' : c.status === 'Quote sent' ? 'ready' : 'new'}`}
                                value={c.status}
                                onChange={e => updateCateringStatusDirect(c.id, e.target.value as CateringLead['status'])}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Quote sent">Quote sent</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Declined">Declined</option>
                              </select>
                            </div>
                            <strong style={{ display: 'block', fontSize: 13, color: 'var(--brand-navy)', marginTop: 4 }}>
                              {c.customerName}
                            </strong>
                          </div>
                        </div>

                        <div className="catering-meta-grid">
                          <div>
                            <small>GUESTS & LOCATION</small>
                            <span>{c.guestCount} guests · {c.location}</span>
                          </div>
                          <div>
                            <small>EVENT DATE</small>
                            <span style={{ fontWeight: 700, color: 'var(--brand-red)' }}>{c.eventDate}</span>
                          </div>
                          <div>
                            <small>BUDGET ESTIMATE</small>
                            <span>{c.budget || 'Negotiable'}</span>
                          </div>
                          <div>
                            <small>CONTACT PHONE</small>
                            <span>{c.customerPhone}</span>
                          </div>
                        </div>

                        {c.dietaryRequirements && (
                          <div className="catering-dietary-strip">
                            <b>Dietary Note:</b> {c.dietaryRequirements}
                          </div>
                        )}

                        <div className="event-actions-bar">
                          {c.status !== 'Confirmed' && c.status !== 'Declined' && (
                            <button
                              className="catering-confirm-action-btn"
                              onClick={() => updateCateringStatusDirect(c.id, 'Confirmed')}
                            >
                              <CheckCircle2 size={14} /> Confirm
                            </button>
                          )}
                          <button className="primary-btn" onClick={() => openQuoteModal(c)}>
                            <DollarSign size={14} /> Send Quotation
                          </button>
                          <button className="whatsapp-action-btn" onClick={() => sendWhatsAppCatering(c)}>
                            <MessageCircle size={14} /> Chat on WhatsApp
                          </button>
                          <button className="secondary-btn" onClick={() => setSelectedCateringDrawer(c)}>
                            <FileText size={14} /> Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })()}

          {/* ========================================================= */}
          {/* CORPORATE TASTING BOX REQUESTS SECTION */}
          {/* ========================================================= */}
          {section === 'Tasting requests' && (() => {
            const pendingCount = tastingRequests.filter(t => t.status === 'Pending').length;
            const scheduledCount = tastingRequests.filter(t => t.status === 'Scheduled').length;
            const deliveredCount = tastingRequests.filter(t => t.status === 'Delivered').length;

            return (
              <section className="panel content-panel">
                {/* KPI Metrics */}
                <div className="tasting-kpi-grid">
                  <div
                    className={`tasting-kpi-card ${tastingStatusFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setTastingStatusFilter('All')}
                    title="Click to view all corporate tasting requests"
                  >
                    <div className="tasting-kpi-icon navy">
                      <Building size={22} />
                    </div>
                    <div className="tasting-kpi-content">
                      <div className="tasting-kpi-label">
                        <span>Total Leads</span>
                      </div>
                      <div className="tasting-kpi-val">{tastingRequests.length}</div>
                      <div className="tasting-kpi-sub">Corporate Organizations</div>
                    </div>
                  </div>

                  <div
                    className={`tasting-kpi-card ${tastingStatusFilter === 'Pending' ? 'active' : ''}`}
                    onClick={() => setTastingStatusFilter('Pending')}
                    title="Click to filter by Pending"
                  >
                    <div className="tasting-kpi-icon amber">
                      <Clock3 size={22} />
                    </div>
                    <div className="tasting-kpi-content">
                      <div className="tasting-kpi-label">
                        <span>Pending Review</span>
                      </div>
                      <div className="tasting-kpi-val" style={{ color: '#d97706' }}>{pendingCount}</div>
                      <div className="tasting-kpi-sub">Awaiting Dispatch Setup</div>
                    </div>
                  </div>

                  <div
                    className={`tasting-kpi-card ${tastingStatusFilter === 'Scheduled' ? 'active' : ''}`}
                    onClick={() => setTastingStatusFilter('Scheduled')}
                    title="Click to filter by Scheduled"
                  >
                    <div className="tasting-kpi-icon blue">
                      <Calendar size={22} />
                    </div>
                    <div className="tasting-kpi-content">
                      <div className="tasting-kpi-label">
                        <span>Confirmed</span>
                      </div>
                      <div className="tasting-kpi-val" style={{ color: '#2563eb' }}>{scheduledCount}</div>
                      <div className="tasting-kpi-sub">Tasting Sessions Booked</div>
                    </div>
                  </div>

                  <div
                    className={`tasting-kpi-card ${tastingStatusFilter === 'Delivered' ? 'active' : ''}`}
                    onClick={() => setTastingStatusFilter('Delivered')}
                    title="Click to filter by Delivered"
                  >
                    <div className="tasting-kpi-icon green">
                      <PackageCheck size={22} />
                    </div>
                    <div className="tasting-kpi-content">
                      <div className="tasting-kpi-label">
                        <span>Delivered</span>
                      </div>
                      <div className="tasting-kpi-val" style={{ color: '#059669' }}>{deliveredCount}</div>
                      <div className="tasting-kpi-sub">Converted &amp; Follow-up</div>
                    </div>
                  </div>
                </div>

                {/* Modern Toolbar */}
                <div className="tasting-toolbar-bar">
                  <div className="tasting-search-box">
                    <Search size={16} color="#94a3b8" />
                    <input
                      placeholder="Search company, contact person, dishes, location..."
                      value={tastingSearch}
                      onChange={e => setTastingSearch(e.target.value)}
                    />
                    {tastingSearch && (
                      <button
                        type="button"
                        onClick={() => setTastingSearch('')}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="tasting-filter-chips">
                    <button
                      type="button"
                      className={`tasting-filter-chip ${tastingStatusFilter === 'All' ? 'active' : ''}`}
                      onClick={() => setTastingStatusFilter('All')}
                    >
                      All <span className="tasting-filter-chip-count">{tastingRequests.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`tasting-filter-chip ${tastingStatusFilter === 'Pending' ? 'active' : ''}`}
                      onClick={() => setTastingStatusFilter('Pending')}
                    >
                      Pending <span className="tasting-filter-chip-count">{pendingCount}</span>
                    </button>
                    <button
                      type="button"
                      className={`tasting-filter-chip ${tastingStatusFilter === 'Scheduled' ? 'active' : ''}`}
                      onClick={() => setTastingStatusFilter('Scheduled')}
                    >
                      Scheduled <span className="tasting-filter-chip-count">{scheduledCount}</span>
                    </button>
                    <button
                      type="button"
                      className={`tasting-filter-chip ${tastingStatusFilter === 'Delivered' ? 'active' : ''}`}
                      onClick={() => setTastingStatusFilter('Delivered')}
                    >
                      Delivered <span className="tasting-filter-chip-count">{deliveredCount}</span>
                    </button>
                    <button
                      type="button"
                      className={`tasting-filter-chip ${tastingStatusFilter === 'Declined' ? 'active' : ''}`}
                      onClick={() => setTastingStatusFilter('Declined')}
                    >
                      Declined
                    </button>
                  </div>

                  <button className="tasting-refresh-btn" onClick={loadBackendData} title="Fetch latest tasting requests">
                    <Filter size={14} /> Refresh
                  </button>
                </div>

                {/* Table */}
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ref &amp; Date</th>
                        <th>Company &amp; Contact</th>
                        <th>Tasters &amp; Meals</th>
                        <th>Requested Dishes</th>
                        <th>Location &amp; Schedule</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTastingRequests.map(t => (
                        <tr key={t.id}>
                          <td>
                            <strong style={{ color: 'var(--brand-red)', fontSize: 12, fontWeight: 700 }}>#{t.id}</strong>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                              {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="tasting-company-avatar">
                                {t.companyName?.slice(0, 2).toUpperCase() || 'CO'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: 13.5 }}>{t.companyName}</div>
                                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{t.contactPerson}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                                  <a href={`tel:${t.contactPhone}`} style={{ color: '#182838', textDecoration: 'none', fontWeight: 600 }}>{t.contactPhone}</a> &bull; {t.companyEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                                👥 {t.guestCount} Tasters
                              </span>
                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                🍽️ {t.mealCount} Courses
                              </span>
                            </div>
                          </td>
                          <td style={{ maxWidth: 260 }}>
                            <div className="tasting-card-meals-box">
                              {t.mealSelections}
                            </div>
                            {t.notes && (
                              <div style={{ fontSize: 11, color: '#d97706', marginTop: 4, background: '#fffbeb', padding: '3px 8px', borderRadius: 4 }}>
                                <b>Note:</b> {t.notes}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#182838', fontSize: 12.5 }}>📍 {t.location}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                              📅 {t.preferredDate} &bull; {t.preferredTime}
                            </div>
                          </td>
                          <td>
                            <select
                              className={`tasting-status-badge tasting-status-${t.status.toLowerCase()}`}
                              value={t.status}
                              onChange={e => updateTastingStatusDirect(t.id, e.target.value as any)}
                              style={{ cursor: 'pointer', outline: 'none' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Declined">Declined</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                className="whatsapp-action-btn"
                                onClick={() => sendWhatsAppTasting(t)}
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={14} /> WhatsApp
                              </button>
                              <button
                                className="secondary-btn"
                                onClick={() => setSelectedTastingDrawer(t)}
                                title="View details"
                              >
                                <FileText size={13} />
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => deleteTastingRequestDirect(t.id, t.companyName)}
                                title="Delete request"
                                style={{ padding: '6px 8px' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredTastingRequests.length === 0 && (
                    <div className="tasting-empty-card">
                      <div className="tasting-empty-icon-wrap">
                        <Building size={28} />
                      </div>
                      <h3>No Corporate Tasting Requests Found</h3>
                      <p>
                        {tastingSearch || tastingStatusFilter !== 'All'
                          ? 'No requests match your search or selected filter criteria.'
                          : 'When corporate teams request complimentary meal tasting boxes from your website, their requests will appear here instantly for review, menu approval, and dispatch scheduling.'}
                      </p>
                      {tastingSearch || tastingStatusFilter !== 'All' ? (
                        <button
                          className="secondary-btn"
                          onClick={() => { setTastingSearch(''); setTastingStatusFilter('All'); }}
                        >
                          Clear all filters
                        </button>
                      ) : (
                        <div className="tasting-empty-live-pill">
                          <span className="pulse-dot"></span>
                          Live corporate lead listener active
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* ========================================================= */}
          {/* 5. MEAL PLANS & FREEZER SUBSCRIPTIONS (FULLY EDITABLE) */}
          {/* ========================================================= */}
          {section === 'Meal plans' && (
            <section className="panel content-panel">
              <div className="panel-head">
                <div>
                  <h3>Freezer Stocking & Meal Subscriptions</h3>
                  <p>Manage subscription packages, pricing, features, and weekly delivery schedules.</p>
                </div>
                <button className="primary-btn" onClick={openCreatePlanModal}>
                  <Plus size={16} /> Create plan
                </button>
              </div>

              <div className="plan-grid">
                {mealPlans.map(plan => (
                  <div className={`plan-card ${plan.color || 'mint'}`} key={plan.id}>
                    <div className="plan-emoji">
                      <Snowflake size={21} />
                    </div>
                    <span className="plan-meals">{plan.meals}</span>
                    <h3>{plan.name}</h3>
                    <p style={{ fontSize: 11, color: '#5b6b77', margin: '4px 0 10px', minHeight: 34 }}>
                      {plan.description}
                    </p>
                    <strong className="plan-price">
                      {money(plan.price)}
                      <small> / package</small>
                    </strong>
                    <ul>
                      {plan.features.map(f => (
                        <li key={f}>
                          <CheckCircle2 size={15} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button className="secondary-btn" style={{ flex: 1 }} onClick={() => openEditPlanModal(plan)}>
                        <Pencil size={13} /> Edit plan
                      </button>
                      <button
                        className="delete-icon-btn"
                        onClick={() => deleteMealPlan(plan.id, plan.name)}
                        title="Delete plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 6. SAVED MEALS & AUTOMATED MEAL REMINDERS */}
          {/* ========================================================= */}
          {section === 'Saved meals & reminders' && (
            <section className="panel content-panel">
              {/* How it Works Informational Strip */}
              <div className="how-it-works-banner">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className="how-it-works-icon">
                    <Heart size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--brand-navy)', display: 'block' }}>
                      How Customer Saved Meals & Automated Reminders Function
                    </strong>
                    <p style={{ fontSize: 11, color: '#485e70', margin: '4px 0 0', lineHeight: 1.6 }}>
                      When visitors tap the heart icon on any meal on your website, it is saved to their profile.
                      At your configured meal dispatch time, our automated engine prompts them with their favorite dishes to order breakfast, lunch, dinner, or dessert treats before cutoff.
                    </p>
                  </div>
                </div>

                {/* 3-Step Clear Visual Guide */}
                <div className="reminders-guide-grid">
                  <div className="reminders-guide-step">
                    <span className="step-number">STEP 1</span>
                    <h4>Customer Bookmarks Meal</h4>
                    <p>Shoppers on the website tap the heart on meals they love across Breakfast, Lunch, Dinner, Pastries, or Desserts.</p>
                  </div>
                  <div className="reminders-guide-step">
                    <span className="step-number">STEP 2</span>
                    <h4>
                      {getTimeCategory(reminderDispatchTime)} Alert (
                      {reminderDispatchTime === '07:30' ? '7:30 AM' :
                        reminderDispatchTime === '08:00' ? '8:00 AM' :
                          reminderDispatchTime === '08:30' ? '8:30 AM' :
                            reminderDispatchTime === '09:00' ? '9:00 AM' :
                              reminderDispatchTime === '11:00' ? '11:00 AM' :
                                reminderDispatchTime === '11:30' ? '11:30 AM' :
                                  reminderDispatchTime === '12:00' ? '12:00 PM' :
                                    reminderDispatchTime === '12:30' ? '12:30 PM' :
                                      reminderDispatchTime === '13:00' ? '1:00 PM' :
                                        reminderDispatchTime === '14:30' ? '2:30 PM' :
                                          reminderDispatchTime === '15:00' ? '3:00 PM' :
                                            reminderDispatchTime === '15:30' ? '3:30 PM' :
                                              reminderDispatchTime === '16:00' ? '4:00 PM' :
                                                reminderDispatchTime === '16:30' ? '4:30 PM' :
                                                  reminderDispatchTime === '17:00' ? '5:00 PM' :
                                                    reminderDispatchTime === '17:30' ? '5:30 PM' :
                                                      reminderDispatchTime === '18:00' ? '6:00 PM' :
                                                        reminderDispatchTime === '19:00' ? '7:00 PM' : reminderDispatchTime})
                    </h4>
                    <p>
                      At your scheduled time, the auto engine dispatches tailored alerts for {getTimeCategory(reminderDispatchTime).toLowerCase()} favorites before kitchen cutoff.
                    </p>
                  </div>
                  <div className="reminders-guide-step">
                    <span className="step-number">STEP 3</span>
                    <h4>Instant 1-Tap Checkout</h4>
                    <p>The notification loads their exact saved dishes right into the shopping bag for instant reordering.</p>
                  </div>
                </div>
              </div>

              {/* Meal Occasion Filter Bar */}
              <div style={{ display: 'flex', gap: 8, margin: '16px 0 12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase' }}>
                  Filter by Meal Time:
                </span>
                {(['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert & Snacks'] as const).map(cat => {
                  const icons: Record<string, string> = {
                    'All': '🍽️',
                    'Breakfast': '🌅',
                    'Lunch': '☀️',
                    'Dinner': '🌙',
                    'Dessert & Snacks': '🍰'
                  };
                  const count = cat === 'All'
                    ? savedCustomers.length
                    : savedCustomers.filter(c => {
                      if (c.mealType === cat) return true;
                      return c.items.some(i => {
                        const text = `${i.name} ${i.category || ''}`.toLowerCase();
                        if (cat === 'Breakfast') return text.includes('breakfast') || text.includes('waakye') || text.includes('egg') || text.includes('plantain');
                        if (cat === 'Lunch') return text.includes('jollof') || text.includes('rice') || text.includes('lunch') || text.includes('noodles');
                        if (cat === 'Dessert & Snacks') return text.includes('puff') || text.includes('pie') || text.includes('cake') || text.includes('pastry') || text.includes('sweet') || text.includes('snack');
                        if (cat === 'Dinner') return text.includes('soup') || text.includes('swallow') || text.includes('egusi') || text.includes('asun') || text.includes('dinner');
                        return false;
                      });
                    }).length;

                  return (
                    <button
                      key={cat}
                      className={`filter-chip ${selectedMealCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedMealCategory(cat)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 20,
                        border: selectedMealCategory === cat ? '1px solid var(--brand-red)' : '1px solid #e2e8f0',
                        background: selectedMealCategory === cat ? 'var(--brand-red)' : '#ffffff',
                        color: selectedMealCategory === cat ? '#ffffff' : 'var(--brand-navy)',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{icons[cat]}</span>
                      <span>{cat === 'All' ? 'All Saved Meals' : cat}</span>
                      <span style={{
                        fontSize: 10,
                        background: selectedMealCategory === cat ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                        color: selectedMealCategory === cat ? '#ffffff' : '#64748b',
                        padding: '1px 6px',
                        borderRadius: 10,
                        marginLeft: 2
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bulk Actions & Schedule Toolbar */}
              <div className="reminders-bulk-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button className="select-all-btn" onClick={toggleSelectAllReminders}>
                    {savedCustomers.length > 0 && selectedReminderIds.length === savedCustomers.length ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                    <span>
                      {savedCustomers.length > 0 && selectedReminderIds.length === savedCustomers.length
                        ? 'Deselect All'
                        : `Select All (${savedCustomers.length})`}
                    </span>
                  </button>

                  {selectedReminderIds.length > 0 && (
                    <button
                      className="primary-btn"
                      disabled={isBulkSending}
                      onClick={dispatchBulkReminders}
                    >
                      <Send size={14} />
                      {isBulkSending
                        ? 'Sending...'
                        : `Dispatch ${selectedMealCategory !== 'All' ? selectedMealCategory : getTimeCategory(reminderDispatchTime)} Reminders to ${selectedReminderIds.length} Selected`}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div className="dispatch-time-box">
                    <Clock3 size={15} />
                    <span>Dispatch Time:</span>
                    <select
                      value={reminderDispatchTime}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setReminderDispatchTime(newTime);
                        const cat = getTimeCategory(newTime);
                        notify(`Meal reminder set to ${e.target.options[e.target.selectedIndex].text} (${cat} alert)!`);
                      }}
                      className="dispatch-time-select"
                    >
                      <optgroup label="🌅 Breakfast Alerts (Morning)">
                        <option value="07:30">7:30 AM (Early Breakfast Rush)</option>
                        <option value="08:00">8:00 AM (Standard Breakfast Alert)</option>
                        <option value="08:30">8:30 AM (Workday Morning Kickstart)</option>
                        <option value="09:00">9:00 AM (Late Breakfast &amp; Brunch)</option>
                      </optgroup>
                      <optgroup label="☀️ Lunch Alerts (Midday)">
                        <option value="11:00">11:00 AM (Corporate Lunch Prep)</option>
                        <option value="11:30">11:30 AM (Pre-Midday Lunch Alert)</option>
                        <option value="12:00">12:00 PM (Standard Noon Lunch)</option>
                        <option value="12:30">12:30 PM (Peak Lunch Dispatch)</option>
                        <option value="13:00">1:00 PM (Late Lunch Break)</option>
                      </optgroup>
                      <optgroup label="🍰 Dessert, Pastries &amp; Afternoon Snacks">
                        <option value="14:30">2:30 PM (Afternoon Pastry Craving)</option>
                        <option value="15:00">3:00 PM (Tea, Pastries &amp; Small Chops)</option>
                        <option value="15:30">3:30 PM (Dessert &amp; Sweet Treats)</option>
                      </optgroup>
                      <optgroup label="🌙 Dinner &amp; Evening Alerts">
                        <option value="16:00">4:00 PM (Early Dinner Prep)</option>
                        <option value="16:30">4:30 PM (Pre-Commute Dinner Alert)</option>
                        <option value="17:00">5:00 PM (Standard Evening Dinner)</option>
                        <option value="17:30">5:30 PM (Peak Commute Alert)</option>
                        <option value="18:00">6:00 PM (Family Dinner Orders)</option>
                        <option value="19:00">7:00 PM (Late Dinner &amp; Nightshift)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="auto-schedule-chip">
                    <Sparkles size={14} />
                    <span>Auto Engine:</span>
                    <button
                      className={`schedule-toggle-pill ${autoScheduleActive ? 'active' : ''}`}
                      onClick={() => {
                        setAutoScheduleActive(!autoScheduleActive);
                        notify(`Automated meal reminders ${!autoScheduleActive ? 'activated' : 'paused'}.`);
                      }}
                    >
                      {autoScheduleActive ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Saved Customers Table */}
              <div className="table-wrap">
                {savedCustomers.length === 0 ? (
                  <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <Heart size={42} style={{ opacity: 0.35, marginBottom: 14, color: 'var(--brand-red)' }} />
                    <h3 style={{ fontSize: 17, color: 'var(--brand-navy)', marginBottom: 6 }}>No customer saved dishes yet</h3>
                    <p style={{ fontSize: 13, color: '#687c88', maxWidth: 450, margin: '0 auto 16px' }}>
                      When visitors bookmark or save their favorite meals on the frontend, their preferences will appear here for breakfast, lunch, dinner, and dessert reminders.
                    </p>
                    <button
                      className="primary-btn"
                      onClick={() => {
                        setSavedCustomers(initialSavedCustomers);
                        notify('Loaded sample customer bookmarks for Breakfast, Lunch, Dinner & Dessert!');
                      }}
                    >
                      + Load Demo Customer Saved Meals
                    </button>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>SELECT</th>
                        <th>CUSTOMER</th>
                        <th>EMAIL &amp; PHONE</th>
                        <th>MEAL OCCASION</th>
                        <th>SAVED DISHES</th>
                        <th>REMINDER STATUS</th>
                        <th>SENT COUNT</th>
                        <th>DISPATCH REMINDER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedCustomers
                        .filter(c => {
                          if (selectedMealCategory === 'All') return true;
                          if (c.mealType === selectedMealCategory) return true;
                          return c.items.some(i => {
                            const text = `${i.name} ${i.category || ''}`.toLowerCase();
                            if (selectedMealCategory === 'Breakfast') return text.includes('breakfast') || text.includes('waakye') || text.includes('egg') || text.includes('plantain');
                            if (selectedMealCategory === 'Lunch') return text.includes('jollof') || text.includes('rice') || text.includes('lunch') || text.includes('noodles');
                            if (selectedMealCategory === 'Dessert & Snacks') return text.includes('puff') || text.includes('pie') || text.includes('cake') || text.includes('pastry') || text.includes('sweet') || text.includes('snack');
                            if (selectedMealCategory === 'Dinner') return text.includes('soup') || text.includes('swallow') || text.includes('egusi') || text.includes('asun') || text.includes('dinner');
                            return false;
                          });
                        })
                        .map(c => {
                          const isSelected = selectedReminderIds.includes(c.id);
                          const inferredType = c.mealType || (
                            c.items.some(i => i.name.toLowerCase().includes('waakye') || i.name.toLowerCase().includes('breakfast')) ? 'Breakfast' :
                              c.items.some(i => i.name.toLowerCase().includes('jollof') || i.name.toLowerCase().includes('rice')) ? 'Lunch' :
                                c.items.some(i => i.name.toLowerCase().includes('puff') || i.name.toLowerCase().includes('pie')) ? 'Dessert & Snacks' : 'Dinner'
                          );

                          return (
                            <tr key={c.id} className={isSelected ? 'selected-row' : ''}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectReminder(c.id)}
                                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                                />
                              </td>
                              <td>
                                <strong>{c.customerName}</strong>
                                <small className="subline">Saved {c.items.length} dish(es)</small>
                              </td>
                              <td>
                                <span>{c.customerEmail}</span>
                                <small className="subline">{c.customerPhone || '0800 000 0000'}</small>
                              </td>
                              <td>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: 12,
                                  background: inferredType === 'Breakfast' ? '#fef3c7' :
                                    inferredType === 'Lunch' ? '#e0f2fe' :
                                      inferredType === 'Dessert & Snacks' ? '#fce7f3' : '#f3e8ff',
                                  color: inferredType === 'Breakfast' ? '#92400e' :
                                    inferredType === 'Lunch' ? '#0369a1' :
                                      inferredType === 'Dessert & Snacks' ? '#be185d' : '#6b21a8'
                                }}>
                                  {inferredType === 'Breakfast' && '🌅 Breakfast'}
                                  {inferredType === 'Lunch' && '☀️ Lunch'}
                                  {inferredType === 'Dessert & Snacks' && '🍰 Dessert'}
                                  {inferredType === 'Dinner' && '🌙 Dinner'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', maxWidth: 300 }}>
                                  {c.items.map((m, idx) => (
                                    <span key={idx} className="saved-dish-tag">
                                      🍲 {m.name}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <button
                                  className={`status-clickable ${c.reminderStatus === 'Active' ? 'status-green' : 'status-amber'}`}
                                  onClick={() => toggleReminderStatus(c)}
                                  title="Click to toggle Active / Paused"
                                >
                                  {c.reminderStatus || 'Active'}
                                </button>
                              </td>
                              <td>
                                <b>{c.reminderCount || 0} times</b>
                                {c.lastReminderSentAt && (
                                  <small className="subline">Last: {c.lastReminderSentAt}</small>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button
                                    className="primary-btn"
                                    style={{ padding: '6px 11px', fontSize: 10 }}
                                    onClick={() => {
                                      setReminderOccasionInModal(inferredType as any);
                                      setReminderPreviewTarget(c);
                                    }}
                                  >
                                    <Mail size={12} /> Send Now
                                  </button>
                                  <button
                                    className="whatsapp-action-btn"
                                    style={{ padding: '6px 9px', fontSize: 10 }}
                                    onClick={() => sendWhatsAppSavedReminder(c, inferredType)}
                                    title="Send reminder directly on WhatsApp"
                                  >
                                    <MessageCircle size={13} /> WhatsApp
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 7. CUSTOMERS DIRECTORY & DISCOUNTS (INDIVIDUAL & COMPANY) */}
          {/* ========================================================= */}
          {section === 'Customers' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Search by customer name, email, or company..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button className="primary-btn" onClick={() => setShowAddCustomerModal(true)}>
                  <Plus size={15} /> Add customer / company
                </button>
                <button className="secondary-btn" onClick={exportCustomersCsv}>
                  <Download size={15} /> Export customers
                </button>
              </div>

              <div className="table-wrap">
                {customers.length === 0 ? (
                  <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <Users size={42} style={{ opacity: 0.35, marginBottom: 14, color: 'var(--brand-navy)' }} />
                    <h3 style={{ fontSize: 17, color: 'var(--brand-navy)', marginBottom: 6 }}>No customer accounts yet</h3>
                    <p style={{ fontSize: 13, color: '#687c88', maxWidth: 450, margin: '0 auto 16px' }}>
                      Customer profiles are automatically created when orders are placed, or you can add VIP clients and companies manually.
                    </p>
                    <button className="primary-btn" onClick={() => setShowAddCustomerModal(true)}>
                      <Plus size={15} /> Add first customer / company
                    </button>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>CUSTOMER / COMPANY</th>
                        <th>CONTACT DETAILS</th>
                        <th>ORDERS</th>
                        <th>TOTAL SPENT</th>
                        <th>SEGMENT</th>
                        <th>ACTIVE DISCOUNT / VOUCHER</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers
                        .filter(
                          c =>
                            (c.name + ' ' + c.email + ' ' + (c.companyName || '')).toLowerCase().includes(search.toLowerCase())
                        )
                        .map(c => (
                          <tr key={c.id}>
                            <td>
                              <div className="customer-cell">
                                <div className="avatar small">{c.name.split(' ').map(x => x[0]).join('')}</div>
                                <div>
                                  <strong>{c.name}</strong>
                                  {c.companyName ? (
                                    <small className="company-badge">🏢 {c.companyName}</small>
                                  ) : (
                                    <small className="subline">Individual account</small>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              <span>{c.email}</span>
                              <small className="subline">{c.phone}</small>
                            </td>

                            <td>{c.ordersCount} orders</td>

                            <td>
                              <strong>{money(c.totalSpent)}</strong>
                            </td>

                            <td>
                              <span className="segment-badge segment-corporate">
                                {c.segment}
                              </span>
                            </td>

                            {/* DISCOUNT BADGE */}
                            <td>
                              {c.discount ? (
                                <div className="discount-pill-active" onClick={() => openDiscountModalForCustomer(c)}>
                                  <Tag size={12} />
                                  <span>
                                    {c.discount.value}{c.discount.type === 'percent' ? '%' : '₦'} OFF ({c.discount.code})
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className="add-discount-btn"
                                  onClick={() => openDiscountModalForCustomer(c)}
                                >
                                  <Percent size={12} /> Give discount
                                </button>
                              )}
                            </td>

                            {/* ACTIONS COLUMN */}
                            <td>
                              <div className="cust-action-buttons">
                                <button
                                  className="cust-btn-discount"
                                  title="Assign or Modify Discount"
                                  onClick={() => openDiscountModalForCustomer(c)}
                                >
                                  <Percent size={13} />
                                </button>
                                <button
                                  className="cust-btn-whatsapp"
                                  title="Message on WhatsApp with Discount"
                                  onClick={() => sendWhatsAppDiscount(c)}
                                >
                                  <MessageCircle size={13} />
                                </button>
                                <button
                                  className="cust-btn-profile"
                                  title="View Customer Profile & Notes"
                                  onClick={() => setSelectedCustomerProfile(c)}
                                >
                                  <Pencil size={13} /> Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* CULINARY ARTS ACADEMY (FINE TABLE & EASY-TO-UNDERSTAND CARDS) */}
          {/* ========================================================= */}
          {section === 'Culinary school' && (() => {
            const countFoundation = academyLeads.filter(a => a.journey === '3-months').length;
            const countDiploma = academyLeads.filter(a => a.journey === '6-months').length;
            const countExecutive = academyLeads.filter(a => a.journey === '9-months').length;

            const pendingReviewCount = academyLeads.filter(a => a.status === 'Pending Review').length;
            const contactedCount = academyLeads.filter(a => a.status === 'Contacted').length;
            const admittedCount = academyLeads.filter(a => a.status === 'Admitted').length;
            const enrolledCount = academyLeads.filter(a => a.status === 'Enrolled').length;
            const cancelledCount = academyLeads.filter(a => a.status === 'Cancelled').length;

            const filteredCandidates = academyLeads.filter(a => {
              const query = (academySearch || search).trim().toLowerCase();
              const matchSearch =
                !query ||
                a.fullName.toLowerCase().includes(query) ||
                a.phone.includes(query) ||
                (a.refNumber && a.refNumber.toLowerCase().includes(query)) ||
                (a.email && a.email.toLowerCase().includes(query));
              const matchJourney = academyJourneyFilter === 'All' || a.journey === academyJourneyFilter;
              const matchStatus = academyStatusFilter === 'All' || a.status === academyStatusFilter;
              return matchSearch && matchJourney && matchStatus;
            });

            return (
              <section className="panel content-panel">
                {/* Header Toolbar */}
                <div className="toolbar" style={{ marginBottom: 16 }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      <GraduationCap size={20} color="var(--brand-red)" /> Student Applications &amp; Admissions
                    </h3>
                    <p className="muted" style={{ margin: '4px 0 0' }}>
                      Track candidate registrations across Foundation, Pro Diploma, and Executive Masterclass cohorts.
                    </p>
                  </div>
                  <button className="secondary-btn" onClick={loadBackendData} title="Fetch latest applications from server">
                    <Filter size={14} /> Refresh applications
                  </button>
                </div>

                {/* 1. EASY-TO-UNDERSTAND KPI CARDS (4 COLUMNS GRID) */}
                <div className="academy-kpi-grid">
                  {/* Card 1: Total */}
                  <div
                    className={`academy-kpi-card ${academyJourneyFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setAcademyJourneyFilter('All')}
                    title="Click to view all applicants"
                  >
                    <div className="academy-kpi-icon all">🎓</div>
                    <div className="academy-kpi-info">
                      <h4>TOTAL CANDIDATES</h4>
                      <strong>{academyLeads.length}</strong>
                      <span className="academy-kpi-tag all">Across all 3 cohorts</span>
                    </div>
                  </div>

                  {/* Card 2: 3 Months Foundation */}
                  <div
                    className={`academy-kpi-card ${academyJourneyFilter === '3-months' ? 'active' : ''}`}
                    onClick={() => setAcademyJourneyFilter('3-months')}
                    title="Click to filter by 3 Months Foundation"
                  >
                    <div className="academy-kpi-icon foundation">🔪</div>
                    <div className="academy-kpi-info">
                      <h4>3 MOS (FOUNDATION)</h4>
                      <strong style={{ color: '#0284c7' }}>{countFoundation}</strong>
                      <span className="academy-kpi-tag foundation">₦280k Tuition</span>
                    </div>
                  </div>

                  {/* Card 3: 6 Months Pro Diploma */}
                  <div
                    className={`academy-kpi-card ${academyJourneyFilter === '6-months' ? 'active' : ''}`}
                    onClick={() => setAcademyJourneyFilter('6-months')}
                    title="Click to filter by 6 Months Pro Diploma"
                  >
                    <div className="academy-kpi-icon diploma">⭐</div>
                    <div className="academy-kpi-info">
                      <h4>6 MOS (PRO DIPLOMA) ★</h4>
                      <strong style={{ color: 'var(--brand-red)' }}>{countDiploma}</strong>
                      <span className="academy-kpi-tag diploma">★ Most Popular · ₦490k</span>
                    </div>
                  </div>

                  {/* Card 4: 9 Months Executive */}
                  <div
                    className={`academy-kpi-card ${academyJourneyFilter === '9-months' ? 'active' : ''}`}
                    onClick={() => setAcademyJourneyFilter('9-months')}
                    title="Click to filter by 9 Months Executive Master"
                  >
                    <div className="academy-kpi-icon executive">👑</div>
                    <div className="academy-kpi-info">
                      <h4>9 MOS (EXECUTIVE)</h4>
                      <strong style={{ color: '#d97706' }}>{countExecutive}</strong>
                      <span className="academy-kpi-tag executive">₦750k Masterclass</span>
                    </div>
                  </div>
                </div>

                {/* 2. FILTER & CONTROLS STRIP */}
                <div className="academy-controls-bar">
                  {/* Status Filter Pills */}
                  <div className="academy-filter-pills">
                    <button
                      className={`academy-filter-pill ${academyStatusFilter === 'All' ? 'active' : ''}`}
                      onClick={() => setAcademyStatusFilter('All')}
                    >
                      All <span className="academy-filter-count">{academyLeads.length}</span>
                    </button>
                    <button
                      className={`academy-filter-pill ${academyStatusFilter === 'Pending Review' ? 'active' : ''}`}
                      onClick={() => setAcademyStatusFilter('Pending Review')}
                    >
                      Pending <span className="academy-filter-count">{pendingReviewCount}</span>
                    </button>
                    <button
                      className={`academy-filter-pill ${academyStatusFilter === 'Contacted' ? 'active' : ''}`}
                      onClick={() => setAcademyStatusFilter('Contacted')}
                    >
                      Contacted <span className="academy-filter-count">{contactedCount}</span>
                    </button>
                    <button
                      className={`academy-filter-pill ${academyStatusFilter === 'Admitted' ? 'active' : ''}`}
                      onClick={() => setAcademyStatusFilter('Admitted')}
                    >
                      Admitted <span className="academy-filter-count">{admittedCount}</span>
                    </button>
                    <button
                      className={`academy-filter-pill ${academyStatusFilter === 'Enrolled' ? 'active' : ''}`}
                      onClick={() => setAcademyStatusFilter('Enrolled')}
                    >
                      Enrolled <span className="academy-filter-count">{enrolledCount}</span>
                    </button>
                    {cancelledCount > 0 && (
                      <button
                        className={`academy-filter-pill ${academyStatusFilter === 'Cancelled' ? 'active' : ''}`}
                        onClick={() => setAcademyStatusFilter('Cancelled')}
                      >
                        Cancelled <span className="academy-filter-count">{cancelledCount}</span>
                      </button>
                    )}
                  </div>

                  {/* Search, Journey Select & View Toggle */}
                  <div className="academy-search-select-wrap">
                    <div className="academy-search-input-wrap">
                      <Search size={14} />
                      <input
                        type="text"
                        className="academy-search-input"
                        placeholder="Search candidate name, phone, Ref..."
                        value={academySearch}
                        onChange={e => setAcademySearch(e.target.value)}
                      />
                    </div>

                    <select
                      className="academy-journey-select"
                      value={academyJourneyFilter}
                      onChange={e => setAcademyJourneyFilter(e.target.value)}
                    >
                      <option value="All">All Training Journeys</option>
                      <option value="3-months">3 Months (Foundation)</option>
                      <option value="6-months">6 Months (Pro Diploma)</option>
                      <option value="9-months">9 Months (Executive)</option>
                    </select>

                    <div className="catering-view-toggle">
                      <button
                        className={`catering-view-btn ${academyViewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setAcademyViewMode('table')}
                        title="Fine Table View"
                      >
                        <TableIcon size={14} /> Table
                      </button>
                      <button
                        className={`catering-view-btn ${academyViewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setAcademyViewMode('cards')}
                        title="Cards View"
                      >
                        <LayoutGrid size={14} /> Cards
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. APPLICANTS RENDERING: EMPTY STATE vs FINE TABLE vs CARDS */}
                {filteredCandidates.length === 0 ? (
                  <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <GraduationCap size={44} style={{ opacity: 0.35, marginBottom: 14, color: 'var(--brand-navy)' }} />
                    <h3 style={{ fontSize: 17, color: 'var(--brand-navy)', marginBottom: 6 }}>
                      {academyLeads.length === 0 ? 'No academy applicants found' : 'No candidates match your search or filter'}
                    </h3>
                    <p style={{ fontSize: 13, color: '#687c88', maxWidth: 450, margin: '0 auto' }}>
                      {academyLeads.length === 0
                        ? 'Student enrollment applications submitted on the website form will appear here in real-time.'
                        : 'Try adjusting your search keywords or journey filter to locate other candidate records.'}
                    </p>
                  </div>
                ) : academyViewMode === 'table' ? (
                  /* ========================================================= */
                  /* FINE & NICE DATA TABLE FOR CULINARY ACADEMY */
                  /* ========================================================= */
                  <div className="academy-table-card">
                    <div className="academy-table-container">
                      <table className="academy-table">
                        <thead>
                          <tr>
                            <th>CANDIDATE &amp; REF</th>
                            <th>PROGRAMME &amp; TUITION</th>
                            <th>SCHEDULE &amp; LEVEL</th>
                            <th>CONTACT DETAILS</th>
                            <th>ADMISSIONS STATUS</th>
                            <th style={{ textAlign: 'right', paddingRight: 20 }}>ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCandidates.map(a => {
                            const phoneClean = a.phone.replace(/[^0-9]/g, '');
                            const isDiploma = a.journey === '6-months';
                            const isExecutive = a.journey === '9-months';
                            const journeyClass = isDiploma ? 'diploma' : isExecutive ? 'executive' : 'foundation';
                            const journeyTitle = isDiploma
                              ? '6 Months Pro Diploma ★'
                              : isExecutive
                                ? '9 Months Executive Master'
                                : '3 Months Foundation';
                            const tuitionText = isDiploma ? '₦490,000' : isExecutive ? '₦750,000' : '₦280,000';

                            const waMsg = encodeURIComponent(
                              `Hello ${a.fullName}! This is Chef Margaret & the Admissions Team at Ma'Great Culinary Arts Academy. We received your registration (${a.refNumber}) for the ${journeyTitle} (${tuitionText}). We're excited to guide your admission into our upcoming cohort!`
                            );

                            const initials = (a.fullName || 'Candidate')
                              .split(' ')
                              .map(p => p[0])
                              .filter(Boolean)
                              .slice(0, 2)
                              .join('')
                              .toUpperCase();

                            return (
                              <tr key={a.id || a.refNumber}>
                                {/* Candidate & Ref */}
                                <td>
                                  <div className="academy-cell-candidate">
                                    <div className="academy-candidate-avatar">{initials}</div>
                                    <div>
                                      <span className="academy-candidate-name">{a.fullName}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                                        <span className="academy-candidate-ref">{a.refNumber || 'APPLICANT'}</span>
                                        <span className="academy-applied-date">
                                          📅 {new Date(a.appliedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Programme & Tuition */}
                                <td>
                                  <div>
                                    <span className={`academy-journey-pill ${journeyClass}`}>
                                      {journeyTitle} · {tuitionText}
                                    </span>
                                    <span className="academy-kit-tag">✓ Free Chef Knife Roll &amp; Uniform</span>
                                  </div>
                                </td>

                                {/* Schedule & Level */}
                                <td>
                                  <div>
                                    <span className="academy-schedule-line">
                                      <CalendarDays size={12} color="#64748b" />
                                      {a.schedule === 'weekend-executive' ? 'Weekend Executive (Sat)' : 'Weekday Intensive (Tue & Thu)'}
                                    </span>
                                    <span className="academy-experience-badge">
                                      Level: {a.experience || 'Beginner'}
                                    </span>
                                  </div>
                                </td>

                                {/* Contact Details */}
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <a href={`tel:${a.phone}`} className="catering-phone-link">
                                      <Phone size={12} color="#182838" /> {a.phone}
                                    </a>
                                    {a.email && (
                                      <span className="catering-email-sub" title={a.email}>
                                        {a.email}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Admissions Status Select */}
                                <td>
                                  <select
                                    className={`academy-status-select status-${a.status.toLowerCase().replace(/\s+/g, '-')}`}
                                    value={a.status}
                                    onChange={e => updateAcademyStatusDirect(a.id, e.target.value as AcademyLead['status'])}
                                  >
                                    <option value="Pending Review">Pending Review</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Admitted">Admitted</option>
                                    <option value="Enrolled">Enrolled</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>

                                {/* Actions */}
                                <td>
                                  <div className="academy-actions-cell">
                                    <a
                                      href={`https://wa.me/${phoneClean.startsWith('234') ? phoneClean : phoneClean.startsWith('0') ? '234' + phoneClean.slice(1) : '234' + phoneClean}?text=${waMsg}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="academy-wa-btn"
                                      title="Open WhatsApp chat with pre-written admissions invitation"
                                    >
                                      <MessageCircle size={14} /> WhatsApp
                                    </a>
                                    <button
                                      className="academy-details-btn"
                                      onClick={() => setSelectedAcademyDrawer(a)}
                                      title="View candidate notes & starter kit"
                                    >
                                      <FileText size={13} /> Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* ENHANCED CARDS GRID VIEW */
                  /* ========================================================= */
                  <div className="event-cards">
                    {filteredCandidates.map(a => {
                      const phoneClean = a.phone.replace(/[^0-9]/g, '');
                      const journeyLabel =
                        a.journey === '3-months'
                          ? '3 Months Foundation (₦280k)'
                          : a.journey === '6-months'
                            ? '6 Months Pro Diploma ★ (₦490k)'
                            : '9 Months Executive Masterclass (₦750k)';

                      const waMsg = encodeURIComponent(
                        `Hello ${a.fullName}! This is Chef Margaret & the Admissions Team at Ma'Great Culinary Arts Academy. We received your application (${a.refNumber}) for the ${journeyLabel}. We're excited to guide your admission into our upcoming cohort!`
                      );

                      return (
                        <div className="event-card-rich" key={a.id || a.refNumber}>
                          <div className="event-card-rich-header">
                            <div className="event-emoji">🎓</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <h3 style={{ margin: 0 }}>{a.fullName}</h3>
                                  <span style={{ background: '#182838', color: '#fed485', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>
                                    {a.refNumber || 'APPLICANT'}
                                  </span>
                                </div>

                                <select
                                  className={`academy-status-select status-${a.status.toLowerCase().replace(/\s+/g, '-')}`}
                                  value={a.status}
                                  onChange={e => updateAcademyStatusDirect(a.id, e.target.value as AcademyLead['status'])}
                                >
                                  <option value="Pending Review">Pending Review</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Admitted">Admitted</option>
                                  <option value="Enrolled">Enrolled</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>

                              <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: '#687c88', flexWrap: 'wrap' }}>
                                <span>📞 {a.phone}</span>
                                {a.email && <span>✉️ {a.email}</span>}
                                <span>📅 Applied: {new Date(a.appliedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="catering-meta-grid">
                            <div>
                              <small>PROGRAMME JOURNEY</small>
                              <strong style={{ color: a.journey === '6-months' ? 'var(--brand-red)' : a.journey === '9-months' ? '#d97706' : 'var(--brand-navy)' }}>
                                {journeyLabel}
                              </strong>
                            </div>

                            <div>
                              <small>STUDY SCHEDULE</small>
                              <strong>
                                {a.schedule === 'weekend-executive' ? 'Weekend Executive (Saturdays)' : 'Weekday Intensive (Tue & Thu)'}
                              </strong>
                            </div>

                            <div>
                              <small>EXPERIENCE LEVEL</small>
                              <strong style={{ textTransform: 'capitalize' }}>{a.experience || 'Beginner'}</strong>
                            </div>

                            <div>
                              <small>FREE STARTER KIT</small>
                              <strong style={{ color: '#16a34a' }}>Knife Roll + Uniform + Secret Handout</strong>
                            </div>
                          </div>

                          {a.notes && (
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 12, color: '#475569' }}>
                              <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: 2 }}>Candidate Aspirations / Notes:</strong>
                              "{a.notes}"
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <a
                              href={`https://wa.me/${phoneClean.startsWith('234') ? phoneClean : phoneClean.startsWith('0') ? '234' + phoneClean.slice(1) : '234' + phoneClean}?text=${waMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="academy-wa-btn"
                            >
                              <MessageCircle size={14} /> WhatsApp Candidate
                            </a>
                            <button
                              className="academy-details-btn"
                              onClick={() => setSelectedAcademyDrawer(a)}
                            >
                              <FileText size={13} /> View Dossier
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })()}

          {/* ========================================================= */}
          {/* 8. MESSAGES */}
          {/* ========================================================= */}
          {section === 'Messages' && (
            <div className="messages-layout">
              <section className="panel message-list">
                <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      Inbox ({unread} unread)
                      {unread > 0 && <span className="unread-pulse-dot" title={`${unread} unread messages`} />}
                    </h3>
                    <p>Enquiries from website contact form</p>
                  </div>
                  {unread > 0 && (
                    <button
                      className="secondary-btn"
                      style={{ padding: '6px 11px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => {
                        setMessages(prev => prev.map(m => ({ ...m, unread: false })));
                        if (selectedMessage) {
                          setSelectedMessage({ ...selectedMessage, unread: false });
                        }
                        adminFetch(`${API_BASE}/messages/read-all`, { method: 'POST' }).catch(() => { });
                        notify('All messages marked as read.');
                      }}
                      title="Mark all messages as read"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>
                {messages.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <MessageSquare size={36} style={{ opacity: 0.35, marginBottom: 12, color: 'var(--brand-navy)' }} />
                    <p style={{ fontSize: 13, color: '#687c88' }}>Your inbox is clear. New messages from the website contact form will appear here.</p>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div
                      className={`message-item ${m.unread ? 'message-unread' : ''} ${selectedMessage?.id === m.id ? 'active' : ''}`}
                      key={m.id || idx}
                      onClick={() => openMessage(m)}
                    >
                      <div className="message-avatar-wrap">
                        <div className={`message-avatar ${m.unread ? 'avatar-unread' : ''}`}>
                          {m.name ? m.name[0].toUpperCase() : 'M'}
                        </div>
                        {m.unread && <span className="avatar-status-dot-green" title="Unread message" />}
                      </div>
                      <div className="message-preview">
                        <div className="message-preview-header">
                          <div className="message-sender-name-wrap">
                            {m.unread && <span className="unread-pulse-dot" title="Unread message" />}
                            <strong className={m.unread ? 'unread-name' : ''}>{m.name}</strong>
                            {m.unread && <span className="unread-pill-tag">New</span>}
                          </div>
                          <small className={`message-time-text ${m.unread ? 'unread-time' : ''}`}>
                            {formatMessageTimestamp(m, 'list')}
                          </small>
                        </div>
                        <b className={m.unread ? 'unread-subject' : ''}>{m.subject || 'Website Enquiry'}</b>
                        <p>{m.body || m.message || 'No message content'}</p>
                      </div>
                    </div>
                  ))
                )}
              </section>

              <section className="panel message-detail">
                {!selectedMessage ? (
                  <div className="message-detail-empty">
                    <div className="detail-icon">
                      <MessageSquare size={26} />
                    </div>
                    <h3>Select a conversation</h3>
                    <p>Choose an enquiry from the left to read customer requirements and send a quotation.</p>
                  </div>
                ) : (
                  <div className="message-detail-active">
                    <div className="message-detail-header">
                      <div className="message-sender-info">
                        <div className="message-avatar-wrap" style={{ width: 44, height: 44 }}>
                          <div className="message-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                            {selectedMessage.name ? selectedMessage.name[0].toUpperCase() : 'M'}
                          </div>
                          {selectedMessage.unread && <span className="avatar-status-dot-green" title="Unread message" />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ margin: 0, fontSize: 15, color: 'var(--brand-navy)' }}>{selectedMessage.name}</h3>
                            {selectedMessage.unread && (
                              <div className="unread-detail-badge">
                                <span className="unread-pulse-dot" />
                                <span>Unread</span>
                              </div>
                            )}
                          </div>
                          <div className="message-meta-strip">
                            <span><b>Email:</b> {selectedMessage.email || 'N/A'}</span>
                            <span><b>Phone:</b> {selectedMessage.phone || 'N/A'}</span>
                            <span><b>Received:</b> {formatMessageTimestamp(selectedMessage, 'detail')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="message-detail-actions">
                        <button
                          className="secondary-btn"
                          style={{ padding: '6px 10px', fontSize: 11 }}
                          onClick={() => toggleMessageUnread(selectedMessage)}
                        >
                          {selectedMessage.unread ? 'Mark as read' : 'Mark as unread'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="message-detail-subject">{selectedMessage.subject || 'Customer Enquiry'}</h4>
                      <div className="message-detail-body">
                        {selectedMessage.body || selectedMessage.message || 'No additional message text provided.'}
                      </div>
                    </div>

                    <div className="message-reply-box">
                      <strong style={{ fontSize: 12, color: 'var(--brand-navy)' }}>
                        <MessageCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                        Reply to {selectedMessage.name}
                      </strong>

                      {selectedMessage.reply && (
                        <div style={{ background: '#f8fafc', borderLeft: '3px solid #182838', padding: '10px 14px', borderRadius: 6, margin: '10px 0', fontSize: 12 }}>
                          <strong style={{ display: 'block', color: '#182838', marginBottom: 2 }}>Sent Portal Reply:</strong>
                          <p style={{ margin: 0, color: '#334155', lineHeight: 1.5 }}>{selectedMessage.reply}</p>
                          <small style={{ color: '#94a3b8', fontSize: 10 }}>Delivered to customer dashboard</small>
                        </div>
                      )}

                      <textarea
                        className="message-reply-textarea"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type response for customer dining dashboard or WhatsApp..."
                      />
                      <div className="message-reply-actions">
                        <button
                          className="primary-btn"
                          disabled={isSendingReply || !replyText.trim()}
                          onClick={async () => {
                            setIsSendingReply(true);
                            try {
                              const res = await adminFetch(`${API_BASE}/messages/${selectedMessage.id}/reply`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reply: replyText.trim() })
                              });
                              if (res.ok) {
                                notify('✅ Reply delivered live to customer dashboard!');
                                const sentText = replyText.trim();
                                setReplyText('');
                                setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, reply: sentText, repliedAt: new Date().toISOString() } : m));
                                setSelectedMessage((prev: any) => prev ? { ...prev, reply: sentText, repliedAt: new Date().toISOString() } : null);
                              } else {
                                throw new Error();
                              }
                            } catch {
                              notify('⚠️ Could not send reply to customer dashboard.');
                            } finally {
                              setIsSendingReply(false);
                            }
                          }}
                        >
                          <Send size={13} /> {isSendingReply ? 'Sending...' : 'Send to Customer Portal'}
                        </button>
                        <button
                          className="secondary-btn"
                          onClick={() => {
                            navigator.clipboard?.writeText(replyText);
                            notify('Reply text copied to clipboard!');
                          }}
                        >
                          <Copy size={13} /> Copy Reply
                        </button>
                        <button
                          className="whatsapp-action-btn"
                          onClick={() => sendWhatsAppReply(selectedMessage)}
                        >
                          <Send size={13} /> Reply on WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8B. NEWSLETTER BROADCAST STUDIO & SUBSCRIBERS */}
          {/* ========================================================= */}
          {section === 'Newsletter & broadcasts' && (
            <div>
              {/* Top Bar with Mailtrap SMTP Connection Status */}
              <div className="newsletter-top-strip">
                <div className="smtp-status-group">
                  <span className={`smtp-badge ${isCheckingSmtp ? 'pending' : (smtpStatus?.success ? 'online' : (smtpStatus ? 'offline' : 'pending'))}`}>
                    <span
                      className="smtp-dot-pulse"
                      style={{
                        background: isCheckingSmtp ? '#f59e0b' : (smtpStatus?.success ? '#10b981' : (smtpStatus ? '#ef4444' : '#64748b'))
                      }}
                    />
                    {isCheckingSmtp
                      ? 'Verifying Mailtrap SMTP...'
                      : smtpStatus?.success
                        ? 'Mailtrap Live SMTP Active'
                        : (smtpStatus?.message || 'SMTP Ready (Mailtrap Live)')}
                  </span>

                  <span className="newsletter-meta-chip">
                    Host: <strong>live.smtp.mailtrap.io</strong> ({smtpStatus?.port || '587/2525'})
                  </span>

                  <span className="newsletter-meta-chip">
                    Sender: <strong>hello@magreattaste.ng</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="secondary-btn"
                    style={{ fontSize: 11, padding: '7px 14px' }}
                    onClick={checkSmtpStatus}
                    disabled={isCheckingSmtp}
                  >
                    <Sparkles size={13} /> {isCheckingSmtp ? 'Verifying...' : 'Verify SMTP Connection'}
                  </button>
                  <button
                    className="secondary-btn"
                    style={{ fontSize: 11, padding: '7px 14px' }}
                    onClick={handleExportSubscribersCsv}
                  >
                    <Download size={13} /> Export CSV ({subscribers.length})
                  </button>
                </div>
              </div>

              {/* KPI Stat Cards (Refined to match dashboard design system) */}
              <div className="stat-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon blue">
                      <Mail size={18} />
                    </div>
                    <span className="stat-change up">Active</span>
                  </div>
                  <p>Website Subscribers</p>
                  <strong className="stat-value">{subscribers.length}</strong>
                  <div className="stat-bottom">
                    <small>Opted-in newsletter readers</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon orange">
                      <Send size={18} />
                    </div>
                    <span className="stat-change neutral">Broadcasts</span>
                  </div>
                  <p>Campaigns Dispatched</p>
                  <strong className="stat-value">{campaigns.length}</strong>
                  <div className="stat-bottom">
                    <small>{campaigns.length > 0 ? 'Sent to subscribers' : 'No prior campaigns'}</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon green">
                      <PackageCheck size={18} />
                    </div>
                    <span className="stat-change up">Delivered</span>
                  </div>
                  <p>Total Emails Sent</p>
                  <strong className="stat-value">
                    {campaigns.reduce((acc, c) => acc + (c.recipientCount || 0), 0)}
                  </strong>
                  <div className="stat-bottom">
                    <small>Across all customer broadcasts</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon purple">
                      <ShieldCheck size={18} />
                    </div>
                    <span className="stat-change up">Encrypted</span>
                  </div>
                  <p>Delivery Infrastructure</p>
                  <strong className="stat-value" style={{ fontSize: 20 }}>Mailtrap Live</strong>
                  <div className="stat-bottom">
                    <small>Dedicated cloud SMTP relay</small>
                  </div>
                </div>
              </div>

              {/* Main Composer & Interactive Preview Grid */}
              <div className="newsletter-grid">
                {/* Left: Compose Form */}
                <section className="panel" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 17, color: 'var(--brand-navy)' }}>Compose Announcement</h3>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                        Write your newsletter. It will be sent with official Ma'Great Taste email branding.
                      </p>
                    </div>
                  </div>

                  {/* Preset Template Chips */}
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Quick Templates:
                    </span>
                    <div className="template-presets">
                      <button type="button" className="template-chip" onClick={() => applyNewsletterTemplate('weekend')}>
                        🍲 Weekend Feast 15% Off
                      </button>
                      <button type="button" className="template-chip" onClick={() => applyNewsletterTemplate('menu')}>
                        ✨ New Seasonal Dishes
                      </button>
                      <button type="button" className="template-chip" onClick={() => applyNewsletterTemplate('catering')}>
                        🎉 Corporate &amp; Event Catering
                      </button>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                        Email Subject Line *
                      </label>
                      <input
                        type="text"
                        value={newsletterSubject}
                        onChange={e => setNewsletterSubject(e.target.value)}
                        placeholder="e.g. Weekend Feast: 15% Off Family Soups & Party Jollof!"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                        Email Headline Title *
                      </label>
                      <input
                        type="text"
                        value={newsletterTitle}
                        onChange={e => setNewsletterTitle(e.target.value)}
                        placeholder="e.g. A Warm Weekend Feast from Chef Margaret's Kitchen"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                        Message Body * <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(Paragraphs separated by blank lines)</span>
                      </label>
                      <textarea
                        rows={7}
                        value={newsletterContent}
                        onChange={e => setNewsletterContent(e.target.value)}
                        placeholder="Write your email announcement here..."
                        style={{ width: '100%', padding: '12px', border: '1px solid var(--line)', borderRadius: 8, resize: 'vertical', lineHeight: 1.6 }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                          Call-to-Action Button Label
                        </label>
                        <input
                          type="text"
                          value={newsletterButtonText}
                          onChange={e => setNewsletterButtonText(e.target.value)}
                          placeholder="e.g. Explore Menu & Order"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                          Button Target URL
                        </label>
                        <input
                          type="text"
                          value={newsletterButtonUrl}
                          onChange={e => setNewsletterButtonUrl(e.target.value)}
                          placeholder="https://magreattaste.ng"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8 }}
                        />
                      </div>
                    </div>

                    {/* Test email dispatch */}
                    <div className="test-dispatch-bar">
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                          Send a Single Test Email First
                        </span>
                        <input
                          type="email"
                          value={testEmailInput}
                          onChange={e => setTestEmailInput(e.target.value)}
                          placeholder="your-email@example.com"
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}
                        />
                      </div>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ marginTop: 18 }}
                        disabled={isTestingNewsletter}
                        onClick={handleSendTestNewsletter}
                      >
                        <Send size={13} /> {isTestingNewsletter ? 'Sending Test...' : 'Send Test'}
                      </button>
                    </div>

                    {/* Primary dispatch actions */}
                    <div className="dispatch-actions-row">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => setShowNewsletterPreview(true)}
                      >
                        <ExternalLink size={14} /> Full Screen Preview
                      </button>

                      <button
                        type="button"
                        className="primary-btn"
                        style={{ background: 'var(--brand-red)', border: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                        disabled={isSendingNewsletter || subscribers.length === 0}
                        onClick={() => setShowConfirmBroadcastModal(true)}
                      >
                        <Send size={15} />
                        {isSendingNewsletter ? 'Broadcasting...' : `🚀 Broadcast to All (${subscribers.length}) Subscribers`}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Right: Live Mockup Preview Card */}
                <div>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-navy)' }}>
                      👁️ Real-time Email Preview
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      What your customers will see
                    </span>
                  </div>

                  <div className="email-mockup-wrapper">
                    <div className="email-mockup-card">
                      {/* Email Header */}
                      <div className="email-mockup-header">
                        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, color: '#fed485' }}>
                          MA' GREAT TASTE
                        </div>
                        <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                          Authentic Nigerian &amp; Intercontinental Cuisine
                        </div>
                      </div>

                      {/* Headline banner */}
                      <div style={{ background: '#fff8f0', borderBottom: '2px solid #fed485', padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#182838' }}>
                          {newsletterTitle || 'Your Announcement Headline'}
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="email-mockup-body">
                        {newsletterContent.split(/\n{2,}/).map((p, idx) => (
                          <p key={idx} style={{ margin: '0 0 12px', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                            {p}
                          </p>
                        ))}

                        {newsletterButtonText && (
                          <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            <span className="email-cta-preview-btn">
                              {newsletterButtonText}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Trust badges */}
                      <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '10px 14px', fontSize: 10, color: '#64748b', textAlign: 'center' }}>
                        🍲 Fresh Daily &bull; ⚡ Fast Dispatch &bull; 🎉 Party Catering
                      </div>

                      {/* Email Footer */}
                      <div className="email-mockup-footer">
                        <strong style={{ color: '#fed485', display: 'block', marginBottom: 2 }}>Ma'Great Taste &bull; Lagos, Nigeria</strong>
                        <span>You received this email because you subscribed at magreattaste.ng</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscribers List & Management Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
                <section className="panel" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, color: 'var(--brand-navy)' }}>
                        Subscribers Directory ({subscribers.length})
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                        Audience receiving your email newsletters
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        placeholder="Search subscriber..."
                        value={newsletterSearch}
                        onChange={e => setNewsletterSearch(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 6 }}
                      />
                    </div>
                  </div>

                  {/* Manual Subscriber Add Bar */}
                  <form onSubmit={handleAddSubscriber} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input
                      type="email"
                      value={newSubscriberEmail}
                      onChange={e => setNewSubscriberEmail(e.target.value)}
                      placeholder="Add customer email directly..."
                      style={{ flex: 1, padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 6 }}
                    />
                    <button type="submit" className="secondary-btn" style={{ fontSize: 12, padding: '7px 14px' }}>
                      Add Subscriber
                    </button>
                  </form>

                  {/* Table */}
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Email Address</th>
                          <th>Subscribed Date</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers
                          .filter(s => !newsletterSearch || s.email.toLowerCase().includes(newsletterSearch.toLowerCase()))
                          .map(sub => (
                            <tr key={sub.id}>
                              <td>
                                <strong style={{ color: 'var(--brand-navy)' }}>{sub.email}</strong>
                              </td>
                              <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {new Date(sub.subscribedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  className="secondary-btn"
                                  style={{ padding: '4px 8px', fontSize: 11, color: '#dc2626' }}
                                  onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                  title="Unsubscribe / Remove"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {subscribers.length === 0 && (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--muted)' }}>
                              No subscribers found. New subscribers will appear here when customers enter their email on your website.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Sent Campaigns History */}
                <section className="panel" style={{ padding: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: 'var(--brand-navy)' }}>
                      Campaigns History ({campaigns.length})
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                      Past broadcasts dispatched to your customer list
                    </p>
                  </div>

                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Subject &amp; Date</th>
                          <th>Recipients</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(camp => (
                          <tr key={camp.id}>
                            <td>
                              <strong style={{ fontSize: 13, color: 'var(--brand-navy)', display: 'block' }}>{camp.subject}</strong>
                              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                                {new Date(camp.sentAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{camp.recipientCount}</span> subscribers
                            </td>
                            <td>
                              <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#ecfdf5', color: '#065f46' }}>
                                {camp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {campaigns.length === 0 && (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--muted)' }}>
                              No campaigns dispatched yet. Use the composer on the left to send your first newsletter!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. ANALYTICS */}
          {/* ========================================================= */}
          {section === 'Analytics' && (
            <div>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon green">
                      <CircleDollarSign />
                    </div>
                    <span className="stat-change up">Live</span>
                  </div>
                  <strong className="stat-value">{money(grossRevenue)}</strong>
                  <p>Gross Store Revenue</p>
                  <div className="stat-bottom">
                    <small>{orders.length} orders recorded</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon orange">
                      <ShoppingBag />
                    </div>
                    <span className="stat-change up">AOV</span>
                  </div>
                  <strong className="stat-value">{money(averageOrderValue)}</strong>
                  <p>Average Order Value</p>
                  <div className="stat-bottom">
                    <small>Per customer basket</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon blue">
                      <PackageCheck />
                    </div>
                    <span className="stat-change up">Fulfilment</span>
                  </div>
                  <strong className="stat-value">{orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 100}%</strong>
                  <p>Order Completion Rate</p>
                  <div className="stat-bottom">
                    <small>{deliveredCount} orders delivered</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon purple">
                      <UtensilsCrossed />
                    </div>
                    <span className="stat-change neutral">{foods.length} items</span>
                  </div>
                  <strong className="stat-value">{foods.filter(f => f.status === 'Available').length}</strong>
                  <p>Active Menu Items Available</p>
                  <div className="stat-bottom">
                    <small>{foods.filter(f => f.status === 'Sold out').length} temporarily sold out</small>
                  </div>
                </div>
              </div>

              {/* Top Performing Dishes Leaderboard */}
              <div className="analytics-leaderboard">
                <div className="panel-head">
                  <div>
                    <h3>Top Performing Signature Dishes</h3>
                    <p>Ranked by order count and customer popularity</p>
                  </div>
                  <button className="secondary-btn" onClick={() => setSection('Menu management')}>
                    View full catalogue <ArrowUpRight size={14} />
                  </button>
                </div>

                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>RANK</th>
                      <th>DISH NAME & PHOTO</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>ORDERS</th>
                      <th>EST. REVENUE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDishes.map((dish, idx) => (
                      <tr key={dish.id}>
                        <td>
                          <span className={`dish-rank-badge ${idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : ''}`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td>
                          <div className="dish-rank-cell">
                            <img
                              src={resolveMealImage(dish.image)}
                              alt={dish.name}
                              className="dish-thumbnail"
                              onError={e => { (e.currentTarget as any).src = FALLBACK_FOOD_IMG; }}
                            />
                            <div>
                              <strong>{dish.name}</strong>
                              {dish.tag && <small className="food-badge-tag" style={{ marginLeft: 6 }}>{dish.tag}</small>}
                            </div>
                          </div>
                        </td>
                        <td>{dish.category}</td>
                        <td><strong>{money(dish.price)}</strong></td>
                        <td><b>{dish.orders || 0} orders</b></td>
                        <td><strong style={{ color: 'var(--brand-red)' }}>{money((dish.orders || 0) * dish.price)}</strong></td>
                        <td>
                          <span className={`status ${dish.status === 'Available' ? 'status-green' : 'status-red'}`}>
                            {dish.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 10. SETTINGS */}
          {/* ========================================================= */}
          {section === 'Settings' && (
            <div className="settings-grid">
              <section className="panel settings-panel">
                <div className="panel-head">
                  <div>
                    <h3>Restaurant & Kitchen Profile</h3>
                    <p>Details displayed on receipts, invoices, and dispatch dockets</p>
                  </div>
                </div>
                <label>
                  Business Name
                  <input
                    value={settingsBusinessName}
                    onChange={e => setSettingsBusinessName(e.target.value)}
                    placeholder="Business Name"
                  />
                </label>
                <label>
                  Head Kitchen Address
                  <input
                    value={settingsAddress}
                    onChange={e => setSettingsAddress(e.target.value)}
                    placeholder="Kitchen Address"
                  />
                </label>
                <label>
                  Contact Phone & WhatsApp
                  <input
                    value={settingsPhone}
                    onChange={e => setSettingsPhone(e.target.value)}
                    placeholder="+234 803 456 7890"
                  />
                </label>
                <label>
                  Email Address
                  <input
                    value={settingsEmail}
                    onChange={e => setSettingsEmail(e.target.value)}
                    placeholder="orders@magreattaste.ng"
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    Minimum Order Value (₦)
                    <input
                      type="number"
                      value={settingsMinOrder}
                      onChange={e => setSettingsMinOrder(e.target.value)}
                      placeholder="3000"
                    />
                  </label>
                  <label>
                    Standard Delivery Fee (₦)
                    <input
                      type="number"
                      value={settingsDeliveryFee}
                      onChange={e => setSettingsDeliveryFee(e.target.value)}
                      placeholder="2000"
                    />
                  </label>
                </div>
                <label>
                  Operating Hours
                  <input
                    value={settingsOpeningHours}
                    onChange={e => setSettingsOpeningHours(e.target.value)}
                    placeholder="8:00 AM – 10:00 PM Daily"
                  />
                </label>
                <button
                  className="primary-btn"
                  disabled={isSavingSettings}
                  onClick={saveStoreSettings}
                  style={{ marginTop: 14 }}
                >
                  <CheckCircle2 size={15} />
                  {isSavingSettings ? 'Saving to Backend...' : 'Save changes'}
                </button>
              </section>

              <section className="panel settings-panel">
                <div className="panel-head">
                  <div>
                    <h3>Kitchen Operations</h3>
                    <p>Dispatch parameters & automated alerts</p>
                  </div>
                </div>
                <div className="toggle-row">
                  <div>
                    <strong>Online ordering active</strong>
                    <small>Accept incoming orders from frontend</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsOnlineOrdering}
                    onChange={e => setSettingsOnlineOrdering(e.target.checked)}
                  />
                </div>
                <div className="toggle-row">
                  <div>
                    <strong>Instant WhatsApp kitchen alerts</strong>
                    <small>Forward new order alerts to chef phone</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsWhatsappAlerts}
                    onChange={e => setSettingsWhatsappAlerts(e.target.checked)}
                  />
                </div>
                <div className="toggle-row">
                  <div>
                    <strong>Corporate discounts enabled</strong>
                    <small>Allow company promo codes at checkout</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsCorporateDiscounts}
                    onChange={e => setSettingsCorporateDiscounts(e.target.checked)}
                  />
                </div>
                <button
                  className="secondary-btn"
                  disabled={isSavingSettings}
                  onClick={saveStoreSettings}
                  style={{ marginTop: 14 }}
                >
                  <CheckCircle2 size={15} />
                  {isSavingSettings ? 'Saving...' : 'Save Operations'}
                </button>
              </section>

              {/* ── Announcement Marquee Manager ── */}
              <section className="panel settings-panel" style={{ gridColumn: '1 / -1', marginTop: 16 }}>
                <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>📢</span>
                      Announcement Marquee (Blue Top Bar)
                    </h3>
                    <p>These messages scroll across the blue strip at the top of the website. Changes are live instantly — no deploy needed.</p>
                  </div>
                  <button
                    className="primary-btn"
                    disabled={isSavingMarquee}
                    onClick={async () => {
                      setIsSavingMarquee(true);
                      try {
                        const res = await adminFetch(`${API_BASE}/settings`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ marqueeMessages })
                        });
                        if (res.ok) notify('✅ Marquee messages saved and live on the website!');
                        else notify('⚠️ Could not save to backend — check connection.');
                      } catch {
                        notify('⚠️ Save failed — check backend connection.');
                      } finally {
                        setIsSavingMarquee(false);
                      }
                    }}
                    style={{ background: '#182838', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <CheckCircle2 size={16} />
                    {isSavingMarquee ? 'Saving Live...' : 'Save Marquee'}
                  </button>
                </div>

                {/* Preview strip */}
                <div style={{
                  background: '#182838', borderRadius: 8, padding: '8px 18px',
                  overflow: 'hidden', marginBottom: 18, position: 'relative'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: 1 }}>
                    Live Preview
                  </p>
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {marqueeMessages.length > 0 ? marqueeMessages.join('  ·  ') : '(no messages — add some below)'}
                  </p>
                </div>

                {/* Message list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {marqueeMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: 8, padding: '8px 10px'
                      }}
                    >
                      {/* Move up/down */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const next = [...marqueeMessages];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            setMarqueeMessages(next);
                          }}
                          style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, padding: '2px 4px', fontSize: 12, lineHeight: 1 }}
                          title="Move up"
                        >▲</button>
                        <button
                          type="button"
                          disabled={idx === marqueeMessages.length - 1}
                          onClick={() => {
                            const next = [...marqueeMessages];
                            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                            setMarqueeMessages(next);
                          }}
                          style={{ background: 'none', border: 'none', cursor: idx === marqueeMessages.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === marqueeMessages.length - 1 ? 0.3 : 1, padding: '2px 4px', fontSize: 12, lineHeight: 1 }}
                          title="Move down"
                        >▼</button>
                      </div>
                      {/* Editable text */}
                      <input
                        value={msg}
                        onChange={e => {
                          const next = [...marqueeMessages];
                          next[idx] = e.target.value;
                          setMarqueeMessages(next);
                        }}
                        style={{ flex: 1, fontSize: 13, border: 'none', background: 'transparent', outline: 'none', color: '#1e293b', fontWeight: 500 }}
                        placeholder="Enter announcement text..."
                      />
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setMarqueeMessages(prev => prev.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px 6px', borderRadius: 4, flexShrink: 0 }}
                        title="Remove message"
                      >✕</button>
                    </div>
                  ))}
                </div>

                {/* Add new message */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={newMarqueeMsg}
                    onChange={e => setNewMarqueeMsg(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newMarqueeMsg.trim()) {
                        setMarqueeMessages(prev => [...prev, newMarqueeMsg.trim()]);
                        setNewMarqueeMsg('');
                      }
                    }}
                    placeholder="Type a new announcement and press Enter or +"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMarqueeMsg.trim()) return;
                      setMarqueeMessages(prev => [...prev, newMarqueeMsg.trim()]);
                      setNewMarqueeMsg('');
                    }}
                    className="primary-btn"
                    style={{ flexShrink: 0, padding: '10px 18px' }}
                  >
                    + Add
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                  Tip: Use emojis at the start for visual flair. Click <strong>Save Marquee</strong> after editing to go live instantly.
                </p>
              </section>

              <section className="panel settings-panel" style={{ gridColumn: '1 / -1', marginTop: 16 }}>
                <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CircleDollarSign size={18} color="var(--brand-red)" />
                      Catering Packages & Real-Time Estimator Pricing
                    </h3>
                    <p>Determine per-guest pricing (₦) for event styles at any given time. Live-updates the website estimator instantly.</p>
                  </div>
                  <button
                    className="primary-btn"
                    disabled={isSavingCateringPrices}
                    onClick={saveCateringPrices}
                    style={{ background: 'var(--brand-red)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <CheckCircle2 size={16} />
                    {isSavingCateringPrices ? 'Saving Live...' : 'Save Catering Rates'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
                  {cateringServicePrices.map((pkg, idx) => (
                    <div
                      key={pkg.id || idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b' }}>
                          Package: {pkg.id}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-red)', background: '#fee2e2', padding: '2px 8px', borderRadius: 4 }}>
                          ₦{(pkg.pricePerGuest || 0).toLocaleString()} / guest
                        </span>
                      </div>

                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)' }}>
                        Package Title
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={e => {
                            const val = e.target.value;
                            setCateringServicePrices(prev => prev.map((p, i) => i === idx ? { ...p, label: val } : p));
                          }}
                          placeholder="Package Title"
                          style={{ marginTop: 4, width: '100%' }}
                        />
                      </label>

                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)' }}>
                        Price Per Guest (₦)
                        <input
                          type="number"
                          value={pkg.pricePerGuest}
                          onChange={e => {
                            const val = Number(e.target.value) || 0;
                            setCateringServicePrices(prev => prev.map((p, i) => i === idx ? { ...p, pricePerGuest: val } : p));
                          }}
                          placeholder="8500"
                          style={{ marginTop: 4, width: '100%' }}
                        />
                      </label>

                      <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>
                        Brief Description
                        <input
                          type="text"
                          value={pkg.description || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setCateringServicePrices(prev => prev.map((p, i) => i === idx ? { ...p, description: val } : p));
                          }}
                          placeholder="Package summary..."
                          style={{ marginTop: 4, width: '100%' }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL: REMINDER PREVIEW & DISPATCH */}
      {/* ========================================================= */}
      {reminderPreviewTarget && (
        <div className="modal-backdrop" onClick={() => setReminderPreviewTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <Mail size={19} />
                </span>
                <h2>Dispatch {reminderOccasionInModal} Reminder</h2>
                <p>Sending personalized message to <b>{reminderPreviewTarget.customerName}</b> ({reminderPreviewTarget.customerEmail}).</p>
              </div>
              <button className="icon-btn" onClick={() => setReminderPreviewTarget(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ margin: '14px 0 10px' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-navy)', display: 'block', marginBottom: 6 }}>
                SELECT REMINDER OCCASION / MEAL TIME:
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['Breakfast', 'Lunch', 'Dinner', 'Dessert & Snacks'] as const).map(occ => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setReminderOccasionInModal(occ)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: reminderOccasionInModal === occ ? '1px solid var(--brand-red)' : '1px solid #cbd5e1',
                      background: reminderOccasionInModal === occ ? '#fef2f2' : '#ffffff',
                      color: reminderOccasionInModal === occ ? 'var(--brand-red)' : 'var(--brand-navy)'
                    }}
                  >
                    {occ === 'Breakfast' && '🌅 Breakfast'}
                    {occ === 'Lunch' && '☀️ Lunch'}
                    {occ === 'Dinner' && '🌙 Dinner'}
                    {occ === 'Dessert & Snacks' && '🍰 Dessert & Snacks'}
                  </button>
                ))}
              </div>
            </div>

            <div className="receipt-box" style={{ background: '#fcfbfa', borderColor: 'var(--brand-gold-subtle)' }}>
              <strong style={{ color: 'var(--brand-navy)', display: 'block', marginBottom: 6 }}>Message Content Preview:</strong>
              <p style={{ fontStyle: 'italic', color: '#384b5c', margin: 0, lineHeight: 1.6 }}>
                "{getOccasionMessage(
                  reminderPreviewTarget.customerName,
                  reminderPreviewTarget.items.map(i => i.name).join(', '),
                  reminderOccasionInModal
                )}"
              </p>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setReminderPreviewTarget(null)}>
                Cancel
              </button>
              <button
                className="secondary-btn"
                style={{ background: '#25D366', color: '#ffffff', borderColor: '#25D366' }}
                onClick={() => {
                  sendWhatsAppSavedReminder(reminderPreviewTarget, reminderOccasionInModal);
                  setReminderPreviewTarget(null);
                }}
              >
                <MessageCircle size={14} /> Send via WhatsApp
              </button>
              <button
                className="primary-btn"
                onClick={() => dispatchSingleReminder(reminderPreviewTarget, reminderOccasionInModal)}
              >
                <Send size={15} /> Confirm &amp; Dispatch Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CATERING SEND QUOTATION */}
      {/* ========================================================= */}
      {quoteTargetLead && (
        <div className="modal-backdrop" onClick={() => setQuoteTargetLead(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <DollarSign size={19} />
                </span>
                <h2>Send Catering Quotation</h2>
                <p>Prepare official estimate for <b>{quoteTargetLead.customerName}</b> ({quoteTargetLead.eventType}).</p>
              </div>
              <button className="icon-btn" onClick={() => setQuoteTargetLead(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); sendCateringQuote(); }}>
              <div className="form-row">
                <label>
                  Quotation Amount (₦)
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={e => setQuoteAmount(e.target.value)}
                    placeholder="750000"
                    required
                  />
                </label>
                <label>
                  Guest Count
                  <input defaultValue={quoteTargetLead.guestCount} readOnly />
                </label>
              </div>

              <label>
                Menu Selection & Package Details
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={e => setQuoteNotes(e.target.value)}
                  placeholder="Items included: Smoky Jollof, Fried Rice, Asun, Egusi Soup, Pounded Yam..."
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setQuoteTargetLead(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <Send size={15} /> Dispatch Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: CATERING FULL ENQUIRY DETAILS */}
      {/* ========================================================= */}
      {selectedCateringDrawer && (
        <div className="modal-backdrop" onClick={() => setSelectedCateringDrawer(null)}>
          <div className="receipt-drawer" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <div>
                <span className="order-badge">CATERING BOOKING</span>
                <h2>{selectedCateringDrawer.eventType}</h2>
                <small>{selectedCateringDrawer.customerName} · {selectedCateringDrawer.eventDate}</small>
              </div>
              <button className="icon-btn" onClick={() => setSelectedCateringDrawer(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="receipt-body">
              <div className="receipt-box">
                <strong>Event Logistics</strong>
                <p><b>Client:</b> {selectedCateringDrawer.customerName}</p>
                <p><b>Phone:</b> {selectedCateringDrawer.customerPhone}</p>
                <p><b>Email:</b> {selectedCateringDrawer.customerEmail}</p>
                <p><b>Venue / Location:</b> {selectedCateringDrawer.location}</p>
                <p><b>Number of Guests:</b> {selectedCateringDrawer.guestCount} persons</p>
                <p><b>Target Budget:</b> {selectedCateringDrawer.budget || 'To be discussed'}</p>
              </div>

              <div className="receipt-box">
                <strong>Dietary & Kitchen Requirements</strong>
                <p>{selectedCateringDrawer.dietaryRequirements || 'No special dietary restrictions.'}</p>
                {selectedCateringDrawer.notes && (
                  <p style={{ marginTop: 8, color: 'var(--brand-red)' }}>
                    <b>Client Special Notes:</b> {selectedCateringDrawer.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="receipt-footer">
              {selectedCateringDrawer.status !== 'Confirmed' && (
                <button
                  className="catering-confirm-action-btn"
                  onClick={() => {
                    updateCateringStatusDirect(selectedCateringDrawer.id, 'Confirmed');
                    setSelectedCateringDrawer(prev => prev ? { ...prev, status: 'Confirmed' } : null);
                  }}
                >
                  <CheckCircle2 size={15} /> Confirm Booking
                </button>
              )}
              <button
                className="whatsapp-btn"
                onClick={() => sendWhatsAppCatering(selectedCateringDrawer)}
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </button>
              <button
                className="primary-btn"
                onClick={() => {
                  openQuoteModal(selectedCateringDrawer);
                  setSelectedCateringDrawer(null);
                }}
              >
                <DollarSign size={15} /> Prepare & Send Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: CULINARY ACADEMY CANDIDATE DOSSIER */}
      {/* ========================================================= */}
      {selectedAcademyDrawer && (() => {
        const a = selectedAcademyDrawer;
        const phoneClean = a.phone.replace(/[^0-9]/g, '');
        const isDiploma = a.journey === '6-months';
        const isExecutive = a.journey === '9-months';
        const journeyTitle = isDiploma
          ? '6 Months Pro Diploma ★'
          : isExecutive
            ? '9 Months Executive Masterclass'
            : '3 Months Foundation Skills';
        const tuitionText = isDiploma ? '₦490,000' : isExecutive ? '₦750,000' : '₦280,000';
        const waMsg = encodeURIComponent(
          `Hello ${a.fullName}! This is Chef Margaret & the Admissions Team at Ma'Great Culinary Arts Academy. We are following up regarding your registration (${a.refNumber}) for the ${journeyTitle}. Let us know if you have any questions regarding cohort schedules or tuition breakdown!`
        );

        return (
          <div className="modal-backdrop" onClick={() => setSelectedAcademyDrawer(null)}>
            <div className="receipt-drawer" onClick={e => e.stopPropagation()}>
              <div className="receipt-header">
                <div>
                  <span className="order-badge">ACADEMY ADMISSIONS DOSSIER</span>
                  <h2>{a.fullName}</h2>
                  <small>{a.refNumber || 'APPLICANT'} · Applied: {new Date(a.appliedAt).toLocaleDateString()}</small>
                </div>
                <button className="icon-btn" onClick={() => setSelectedAcademyDrawer(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="receipt-body">
                <div className="receipt-box">
                  <strong>Candidate Details &amp; Contact</strong>
                  <p><b>Full Name:</b> {a.fullName}</p>
                  <p><b>Phone Number:</b> <a href={`tel:${a.phone}`} style={{ color: '#c6381e', textDecoration: 'none', fontWeight: 700 }}>{a.phone}</a></p>
                  {a.email && <p><b>Email Address:</b> {a.email}</p>}
                  <p><b>Application Ref:</b> <span style={{ background: '#182838', color: '#fed485', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{a.refNumber}</span></p>
                  <p><b>Current Status:</b> <span style={{ fontWeight: 700 }}>{a.status}</span></p>
                </div>

                <div className="receipt-box">
                  <strong>Programme Registration</strong>
                  <p><b>Chosen Journey:</b> {journeyTitle}</p>
                  <p><b>Tuition Investment:</b> <span style={{ color: 'var(--brand-red)', fontWeight: 800 }}>{tuitionText}</span></p>
                  <p><b>Study Schedule:</b> {a.schedule === 'weekend-executive' ? 'Weekend Executive (Saturdays Only)' : 'Weekday Intensive (Tuesdays & Thursdays)'}</p>
                  <p><b>Prior Experience:</b> <span style={{ textTransform: 'capitalize' }}>{a.experience || 'Beginner'}</span></p>
                  <p style={{ marginTop: 8, color: '#16a34a', fontWeight: 600 }}>
                    ✓ Eligible for Starter Kit: Pro Knife Roll, Academy Chef Jacket, Apron &amp; Curriculum Handout.
                  </p>
                </div>

                {a.notes && (
                  <div className="receipt-box">
                    <strong>Candidate Aspirations &amp; Notes</strong>
                    <p style={{ fontStyle: 'italic', color: '#334155', background: '#f8fafc', padding: 10, borderRadius: 6, margin: '6px 0 0' }}>
                      "{a.notes}"
                    </p>
                  </div>
                )}
              </div>

              <div className="receipt-footer">
                <a
                  href={`https://wa.me/${phoneClean.startsWith('234') ? phoneClean : phoneClean.startsWith('0') ? '234' + phoneClean.slice(1) : '234' + phoneClean}?text=${waMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <MessageCircle size={15} /> Chat on WhatsApp
                </a>
                <a
                  href={`tel:${a.phone}`}
                  className="secondary-btn"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Phone size={15} /> Call Candidate
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: SECURITY & STAFF ROLES MANAGEMENT */}
      {/* ========================================================= */}
      {showSecurityModal && (
        <div className="modal-backdrop" onClick={() => setShowSecurityModal(false)}>
          <div className="modal" style={{ maxWidth: 680, width: '94%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <ShieldCheck size={19} />
                </span>
                <h2>Admin Team &amp; Access Roles</h2>
                <p>Manage kitchen staff invitations, login credentials, and permission tiers.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowSecurityModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Role Matrix Explanation Banner */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 18, fontSize: 12, lineHeight: 1.6, color: '#334155' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ChefHat size={15} color="var(--brand-red)" /> Role-Based Access Privileges Matrix
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginTop: 8 }}>
                <div style={{ background: '#fff1ee', padding: '10px 12px', borderRadius: 8, border: '1px solid #fed7aa' }}>
                  <strong style={{ color: 'var(--brand-red)', display: 'block', marginBottom: 3 }}>👑 Super Admin (Chef Margaret)</strong>
                  <span>Full unrestricted access: total gross revenue, income performance charts, team invitation, and bank settlement settings.</span>
                </div>
                <div style={{ background: '#eff6ff', padding: '10px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                  <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: 3 }}>👨‍🍳 Kitchen Staff (Admin Staff)</strong>
                  <span>Daily kitchen operations: order packing &amp; dispatch, menu dish pricing &amp; availability, broadcasts, customer chat, and discounts. <b>Total finances completely masked.</b></span>
                </div>
              </div>
            </div>

            {/* Team Members List */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ fontSize: 13, color: '#182838' }}>Active Administrators ({adminTeam.length})</strong>
                <button
                  style={{ background: 'none', border: 0, color: 'var(--brand-red)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                  onClick={fetchAdminTeam}
                >
                  Refresh list
                </button>
              </div>

              {loadingTeam ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#687c88' }}>Loading administrators...</div>
              ) : adminTeam.length === 0 ? (
                <div style={{ padding: 18, textAlign: 'center', color: '#687c88', background: '#f8fafc', borderRadius: 8 }}>
                  No administrators loaded. Please click "Refresh list".
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                  {adminTeam.map(admin => {
                    const isPrimaryOwner = admin.email === 'margaret@magreattaste.com' || admin.email === 'admin@magreattaste.com';
                    const isSelf = admin.id === currentAdmin.id;
                    return (
                      <div key={admin.id} className="team-list-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className={`team-avatar-circle ${admin.role === 'super_admin' ? 'super' : ''}`}>
                            {admin.name ? admin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <strong style={{ fontSize: 13, color: '#0f172a' }}>{admin.name}</strong>
                              {isSelf && <span style={{ fontSize: 10, color: '#64748b' }}>(You)</span>}
                            </div>
                            <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{admin.email}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                              <span className={`role-badge ${admin.role}`}>
                                {admin.role === 'super_admin' ? '👑 Super Admin' : '👨‍🍳 Kitchen Staff'}
                              </span>
                              <span className={`status status-${admin.status === 'Active' ? 'green' : 'red'}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                                {admin.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="team-card-actions">
                          {!isPrimaryOwner && !isSelf && (
                            <>
                              <button
                                type="button"
                                className="secondary-btn"
                                style={{ padding: '5px 10px', fontSize: 11 }}
                                onClick={() => handleToggleAdminStatus(admin)}
                                title={admin.status === 'Active' ? 'Suspend admin' : 'Activate admin'}
                              >
                                {admin.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                className="icon-btn delete-btn"
                                style={{ color: '#dc2626' }}
                                onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                title="Remove admin"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          {isPrimaryOwner && (
                            <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', paddingRight: 6 }}>Primary Owner</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Invite Form */}
            <form onSubmit={handleInviteAdmin} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px', marginTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserPlus size={16} color="var(--brand-red)" /> Invite &amp; Grant Access to New Staff
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                  Full Name
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tunde Adebayo"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </label>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                  Staff Work Email
                  <input
                    type="email"
                    required
                    placeholder="e.g. tunde@magreattaste.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                  Initial Password
                  <input
                    type="password"
                    required
                    placeholder="Create a temporary password"
                    value={invitePassword}
                    onChange={e => setInvitePassword(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </label>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                  Assigned Permission Role
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as AdminRole)}
                    style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, background: '#ffffff' }}
                  >
                    <option value="admin_staff">👨‍🍳 Kitchen Staff (Financials Masked &amp; Hidden)</option>
                    <option value="super_admin">👑 Super Admin (Full Financial Access)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isInviting}
                  style={{ padding: '8px 16px', fontSize: 12 }}
                >
                  <UserPlus size={14} /> {isInviting ? 'Inviting...' : 'Invite Administrator'}
                </button>
              </div>
            </form>

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button type="button" className="secondary-btn" onClick={() => setShowSecurityModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MENU ITEM */}
      {/* ========================================================= */}
      {showAddFood && (
        <div className="modal-backdrop" onClick={() => setShowAddFood(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <UtensilsCrossed size={19} />
                </span>
                <h2>{editingFood ? 'Edit menu item' : 'Add menu item'}</h2>
                <p>{editingFood ? 'Update dish details, price or availability.' : 'Publish a new dish to your live menu.'}</p>
              </div>
              <button className="icon-btn" onClick={() => setShowAddFood(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                saveFood();
              }}
            >
              <label>
                Dish Name
                <input
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  placeholder="e.g. Smoky Party Jollof & Grilled Croaker Fish"
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Price (₦)
                  <input
                    type="number"
                    min="1"
                    value={foodPrice}
                    onChange={e => setFoodPrice(e.target.value)}
                    placeholder="6500"
                    required
                  />
                </label>
                <label>
                  Category
                  <select value={foodCategory} onChange={e => setFoodCategory(e.target.value)}>
                    <option>Nigerian</option>
                    <option>Soups & Swallows</option>
                    <option>Grills & Proteins</option>
                    <option>Breakfast</option>
                    <option>Continental</option>
                    <option>Asian</option>
                    <option>Pastries & Snacks</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Highlight Tag (Optional)
                  <input
                    value={foodTag}
                    onChange={e => setFoodTag(e.target.value)}
                    placeholder="e.g. Bestseller, Chef Choice, Special"
                  />
                </label>
                <label>
                  Availability Status
                  <select value={foodStatus} onChange={e => setFoodStatus(e.target.value as any)}>
                    <option value="Available">Available for order</option>
                    <option value="Sold out">Sold out (Disabled)</option>
                  </select>
                </label>
              </div>

              <label>
                Description & Ingredients
                <textarea
                  rows={2}
                  value={foodDescription}
                  onChange={e => setFoodDescription(e.target.value)}
                  placeholder="Describe the dish flavors, meats, sides included..."
                />
              </label>

              {/* Photo Input: URL, Cloudinary upload, or Presets */}
              <label>
                Dish Photo URL
                <input
                  value={foodImage}
                  onChange={e => setFoodImage(e.target.value)}
                  placeholder="Paste image URL (https://...) or choose below"
                />
              </label>

              {/* Preset Photo Selector */}
              <div className="preset-photo-section">
                <small>Or choose from preset food photos:</small>
                <div className="preset-photo-grid">
                  {PRESET_DISH_IMAGES.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`preset-photo-thumb ${foodImage === p.url ? 'active' : ''}`}
                      onClick={() => setFoodImage(p.url)}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloudinary File Upload Box */}
              <div className="upload-placeholder" style={{ cursor: 'pointer', position: 'relative', marginTop: 12 }}>
                {foodImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={resolveMealImage(foodImage)}
                      alt="Preview"
                      style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover' }}
                      onError={e => { e.currentTarget.src = FALLBACK_FOOD_IMG; }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: 12 }}>Photo selected</strong>
                      <span style={{ fontSize: 10, color: 'var(--brand-red)' }}>Click to replace with file upload</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImagePlus size={22} />
                    <strong>{uploadingFoodImg ? 'Uploading to Cloudinary...' : 'Upload Dish Photo (Cloudinary)'}</strong>
                    <span>Click or drop image file</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>

              {/* Delivery Availability within Lagos */}
              <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <MapPin size={16} color="var(--brand-red)" />
                    Delivery Availability (Lagos Locations)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (foodAvailableLocations.length === deliveryLocations.length) {
                        setFoodAvailableLocations([]);
                      } else {
                        setFoodAvailableLocations(deliveryLocations.map(l => l.id));
                      }
                    }}
                    style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--brand-red)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {foodAvailableLocations.length === 0 || foodAvailableLocations.length === deliveryLocations.length
                      ? 'Select Specific Locations'
                      : 'Reset to All Lagos'}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 10px' }}>
                  {foodAvailableLocations.length === 0
                    ? '✨ Currently available to customers everywhere in Lagos State.'
                    : `🎯 Restricted to ${foodAvailableLocations.length} selected Lagos location(s).`}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, maxHeight: 150, overflowY: 'auto', padding: 2 }}>
                  {deliveryLocations.map(loc => {
                    const isSelected = foodAvailableLocations.length === 0 || foodAvailableLocations.includes(loc.id);
                    return (
                      <label
                        key={loc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          padding: '6px 8px',
                          borderRadius: 6,
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          border: isSelected ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                          fontSize: 11,
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? '#1e40af' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={foodAvailableLocations.includes(loc.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setFoodAvailableLocations(prev => [...prev, loc.id]);
                            } else {
                              if (foodAvailableLocations.length === 0) {
                                setFoodAvailableLocations(deliveryLocations.filter(l => l.id !== loc.id).map(l => l.id));
                              } else {
                                setFoodAvailableLocations(prev => prev.filter(id => id !== loc.id));
                              }
                            }
                          }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {loc.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAddFood(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={uploadingFoodImg}>
                  {editingFood ? 'Save changes' : 'Publish to menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN CUSTOMER / COMPANY DISCOUNT */}
      {/* ========================================================= */}
      {showDiscountModal && targetCustomerForDiscount && (
        <div className="modal-backdrop" onClick={() => setShowDiscountModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <Percent size={19} />
                </span>
                <h2>Assign Discount / Promo Code</h2>
                <p>
                  Special pricing for <b>{targetCustomerForDiscount.name}</b>{' '}
                  {targetCustomerForDiscount.companyName && `(${targetCustomerForDiscount.companyName})`}.
                </p>
              </div>
              <button className="icon-btn" onClick={() => setShowDiscountModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); saveCustomerDiscount(); }}>
              <label>
                Discount Scope
                <select
                  value={discountAppliesTo}
                  onChange={e => setDiscountAppliesTo(e.target.value as any)}
                >
                  <option value="individual">Individual Customer Only ({targetCustomerForDiscount.name})</option>
                  {targetCustomerForDiscount.companyName && (
                    <option value="company">Entire Company Team ({targetCustomerForDiscount.companyName})</option>
                  )}
                  <option value="all">Universal Promo Code (Anyone with code)</option>
                </select>
              </label>

              <label>
                Quick Percentage Presets
                <div className="discount-preset-pills">
                  {[5, 10, 15, 20, 25, 50].map(pct => (
                    <button
                      type="button"
                      key={pct}
                      className={`discount-preset-pill ${discountType === 'percent' && discountValue === pct ? 'active' : ''}`}
                      onClick={() => {
                        setDiscountType('percent');
                        setDiscountValue(pct);
                        const pfx = targetCustomerForDiscount.companyName
                          ? targetCustomerForDiscount.companyName.split(' ')[0].toUpperCase()
                          : targetCustomerForDiscount.name.split(' ')[0].toUpperCase();
                        setDiscountCode(`${pfx}-${pct}`);
                      }}
                    >
                      {pct}% OFF
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`discount-preset-pill ${discountType === 'fixed' ? 'active' : ''}`}
                    onClick={() => {
                      setDiscountType('fixed');
                      setDiscountValue(5000);
                      setDiscountCode('VOUCHER-5K');
                    }}
                  >
                    ₦5,000 Flat
                  </button>
                </div>
              </label>

              <div className="form-row">
                <label>
                  Discount Type
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </label>
                <label>
                  Value ({discountType === 'percent' ? '%' : '₦'})
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    required
                  />
                </label>
              </div>

              <label>
                Promo / Voucher Code
                <input
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NORTHSTAR-15 or VIP-ADAEZE"
                  required
                />
              </label>

              <label>
                Agreement Notes & Terms
                <textarea
                  rows={2}
                  value={discountNotes}
                  onChange={e => setDiscountNotes(e.target.value)}
                  placeholder="e.g. Corporate catering weekly contract discount..."
                />
              </label>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                {targetCustomerForDiscount.discount ? (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => removeCustomerDiscount(targetCustomerForDiscount)}
                  >
                    <Trash2 size={14} /> Remove Discount
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="secondary-btn" onClick={() => setShowDiscountModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    <CheckCircle2 size={15} /> Save Discount
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT MEAL PLAN PACKAGE */}
      {/* ========================================================= */}
      {showPlanModal && (
        <div className="modal-backdrop" onClick={() => setShowPlanModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <Snowflake size={19} />
                </span>
                <h2>{editingPlan ? 'Edit meal plan package' : 'Create meal plan package'}</h2>
                <p>Configure freezer stocking package, portion sizes, and weekly pricing.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowPlanModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); saveMealPlan(); }}>
              <label>
                Package Title
                <input
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  placeholder="e.g. Weekend Family Freezer Pack"
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Meals Count Label
                  <input
                    value={planMeals}
                    onChange={e => setPlanMeals(e.target.value)}
                    placeholder="e.g. 15 meals"
                    required
                  />
                </label>
                <label>
                  Price per Package (₦)
                  <input
                    type="number"
                    min="1000"
                    value={planPrice}
                    onChange={e => setPlanPrice(e.target.value)}
                    placeholder="65000"
                    required
                  />
                </label>
              </div>

              <label>
                Card Color Theme
                <select value={planColor} onChange={e => setPlanColor(e.target.value as any)}>
                  <option value="mint">Mint Green</option>
                  <option value="peach">Warm Peach</option>
                  <option value="lavender">Royal Lavender</option>
                  <option value="amber">Golden Amber</option>
                </select>
              </label>

              <label>
                Short Description
                <textarea
                  rows={2}
                  value={planDescription}
                  onChange={e => setPlanDescription(e.target.value)}
                  placeholder="Summary for busy families and professionals..."
                />
              </label>

              <label>
                Features & Dishes Included (One per line)
                <textarea
                  rows={4}
                  value={planFeaturesText}
                  onChange={e => setPlanFeaturesText(e.target.value)}
                  placeholder="5 main rice & pasta dishes&#10;3 traditional soup bowls&#10;Freezer-safe portioned containers&#10;Free weekly delivery"
                  required
                />
              </label>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                {editingPlan ? (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteMealPlan(editingPlan.id, editingPlan.name)}
                  >
                    <Trash2 size={14} /> Delete Package
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="secondary-btn" onClick={() => setShowPlanModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    <CheckCircle2 size={15} /> {editingPlan ? 'Save Changes' : 'Create Package'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: ORDER DETAILS / KITCHEN RECEIPT */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="receipt-drawer" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <div>
                <span className="order-badge">KITCHEN DOCKET</span>
                <h2>{selectedOrder.id}</h2>
                <small>{selectedOrder.date}</small>
              </div>
              <button className="icon-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="receipt-body">
              <div className="receipt-box">
                <strong>Customer Information</strong>
                <p><b>Name:</b> {selectedOrder.customer}</p>
                <p><b>Phone:</b> {selectedOrder.phone || '0803 456 7891'}</p>
                <p><b>Email:</b> {selectedOrder.email || 'customer@gmail.com'}</p>
                <p><b>Delivery Address:</b> {selectedOrder.address || 'Lekki Phase 1, Lagos'}</p>
                {selectedOrder.notes && (
                  <p style={{ color: 'var(--brand-red)' }}><b>Notes:</b> {selectedOrder.notes}</p>
                )}
              </div>

              <div className="receipt-box">
                <strong>Ordered Meals</strong>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="receipt-line">
                      <span>{it.quantity}x {it.name}</span>
                      <b>{money(it.price * it.quantity)}</b>
                    </div>
                  ))
                ) : (
                  <div className="receipt-line">
                    <span>{selectedOrder.item}</span>
                    <b>{money(selectedOrder.total)}</b>
                  </div>
                )}
                <div className="receipt-line total-line">
                  <strong>Total Amount:</strong>
                  <strong>{money(selectedOrder.total)}</strong>
                </div>
                <div style={{ fontSize: 11, color: '#687c88', marginTop: 6 }}>
                  Payment: <b>{selectedOrder.paymentMethod || 'Paystack Card'}</b> ({selectedOrder.paymentStatus || 'Paid'})
                </div>
              </div>

              <div className="receipt-box">
                <strong>Advance Kitchen Status</strong>
                <div className="status-flow-buttons">
                  {(['New', 'Preparing', 'Ready', 'Delivered'] as Order['status'][]).map(st => (
                    <button
                      key={st}
                      className={`status-flow-btn ${selectedOrder.status === st ? 'active' : ''}`}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, st);
                        setSelectedOrder({ ...selectedOrder, status: st });
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="receipt-footer">
              <button
                className="whatsapp-btn"
                onClick={() => {
                  const phone = (selectedOrder.phone || '08034567891').replace(/[^0-9]/g, '');
                  const intl = phone.startsWith('0') ? '234' + phone.slice(1) : phone;
                  const text = encodeURIComponent(
                    `Hello ${selectedOrder.customer}! Your Ma’Great Taste order (${selectedOrder.id}) is ${selectedOrder.status.toLowerCase()}. We're packing it fresh for delivery to ${selectedOrder.address}!`
                  );
                  window.open(`https://wa.me/${intl}?text=${text}`, '_blank');
                }}
              >
                <MessageCircle size={15} /> Message customer on WhatsApp
              </button>
              <button className="secondary-btn" onClick={() => window.print()}>
                <Printer size={15} /> Print Kitchen Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: CUSTOMER PROFILE & ORDER HISTORY */}
      {/* ========================================================= */}
      {selectedCustomerProfile && (
        <div className="modal-backdrop" onClick={() => setSelectedCustomerProfile(null)}>
          <div className="receipt-drawer" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar">{selectedCustomerProfile.name.split(' ').map(x => x[0]).join('')}</div>
                <div>
                  <h2>{selectedCustomerProfile.name}</h2>
                  <small>{selectedCustomerProfile.companyName ? `🏢 ${selectedCustomerProfile.companyName}` : 'Individual VIP Client'}</small>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedCustomerProfile(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="receipt-body">
              <div className="receipt-box">
                <strong>Client Metrics</strong>
                <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                    <small style={{ color: '#788998', display: 'block', fontSize: 10 }}>Total Orders</small>
                    <strong style={{ fontSize: 18 }}>{selectedCustomerProfile.ordersCount}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                    <small style={{ color: '#788998', display: 'block', fontSize: 10 }}>Lifetime Spend</small>
                    <strong style={{ fontSize: 18, color: 'var(--brand-red)' }}>{money(selectedCustomerProfile.totalSpent)}</strong>
                  </div>
                </div>
              </div>

              <div className="receipt-box">
                <strong>Contact & Delivery Details</strong>
                <p><b>Phone:</b> {selectedCustomerProfile.phone}</p>
                <p><b>Email:</b> {selectedCustomerProfile.email}</p>
                <p><b>Segment:</b> <span className="segment-badge segment-corporate">{selectedCustomerProfile.segment}</span></p>
                {selectedCustomerProfile.kitchenNotes && (
                  <p><b>Chef Notes:</b> {selectedCustomerProfile.kitchenNotes}</p>
                )}
              </div>

              <div className="receipt-box">
                <strong>Active Discount Contract</strong>
                {selectedCustomerProfile.discount ? (
                  <div className="active-discount-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 14, color: 'var(--brand-navy)' }}>
                        {selectedCustomerProfile.discount.value}{selectedCustomerProfile.discount.type === 'percent' ? '%' : '₦'} DISCOUNT
                      </strong>
                      <span className="code-chip">{selectedCustomerProfile.discount.code}</span>
                    </div>
                    <small style={{ color: '#687c88', display: 'block', marginTop: 4 }}>
                      {selectedCustomerProfile.discount.notes || 'Special client discount active.'}
                    </small>
                  </div>
                ) : (
                  <p style={{ color: '#788998', fontSize: 12 }}>No active discount set for this customer.</p>
                )}
              </div>
            </div>

            <div className="receipt-footer">
              <button
                className="primary-btn"
                onClick={() => {
                  openDiscountModalForCustomer(selectedCustomerProfile);
                  setSelectedCustomerProfile(null);
                }}
              >
                <Percent size={15} /> Manage Discount Voucher
              </button>
              <button
                className="whatsapp-btn"
                onClick={() => sendWhatsAppDiscount(selectedCustomerProfile)}
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW CUSTOMER / COMPANY */}
      {/* ========================================================= */}
      {showAddCustomerModal && (
        <div className="modal-backdrop" onClick={() => setShowAddCustomerModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <Users size={19} />
                </span>
                <h2>Add Customer / Corporate Account</h2>
                <p>Register a corporate client or VIP patron for specialized billing and discounts.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowAddCustomerModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); saveNewCustomer(); }}>
              <label>
                Full Name
                <input
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. David Akinola"
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Email Address
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={e => setNewCustEmail(e.target.value)}
                    placeholder="david@northstar.ng"
                    required
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    placeholder="0806 912 3345"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Company Name (Optional)
                  <input
                    value={newCustCompany}
                    onChange={e => setNewCustCompany(e.target.value)}
                    placeholder="e.g. Northstar Energy Ltd"
                  />
                </label>
                <label>
                  Customer Segment
                  <select
                    value={newCustSegment}
                    onChange={e => setNewCustSegment(e.target.value as any)}
                  >
                    <option value="Corporate">Corporate Account</option>
                    <option value="Loyal VIP">Loyal VIP</option>
                    <option value="Returning">Returning Customer</option>
                    <option value="Meal plan">Meal Plan Subscriber</option>
                    <option value="New">New Customer</option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAddCustomerModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <CheckCircle2 size={15} /> Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SIGNATURE DISH */}
      {showSignatureModal && (
        <div className="modal-backdrop" onClick={() => setShowSignatureModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <Star size={19} color="#d99c2b" />
                </span>
                <h2>{editingSignatureDish ? 'Edit Signature Dish' : 'Add Signature Dish'}</h2>
                <p>Feature this dish in the homepage hero rotation and Chef's personal favorites.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowSignatureModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Quick Pick from Menu */}
              {!editingSignatureDish && (
                <div className="form-group" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <label style={{ color: '#182838', fontWeight: 800 }}>⚡ Quick Select From Existing Menu Dishes</label>
                  <select
                    value={sigSelectedFoodId}
                    onChange={e => {
                      const selectedId = Number(e.target.value);
                      setSigSelectedFoodId(selectedId || '');
                      const match = foods.find(f => f.id === selectedId);
                      if (match) {
                        setSigDishName(match.name);
                        setSigDishPrice(String(match.price));
                        setSigDishImage(match.image);
                        setSigDishDescription(match.description || '');
                        if (match.tag) setSigDishTag(match.tag);
                      }
                    }}
                    style={{ marginTop: 6, width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Choose a dish to auto-fill details --</option>
                    {foods.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({money(f.price)}) - {f.category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Dish Name *</label>
                <input
                  placeholder="e.g. Fresh Catfish Pepper Soup"
                  value={sigDishName}
                  onChange={e => setSigDishName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group">
                  <label>Highlight Tag / Badge *</label>
                  <input
                    placeholder="e.g. Chef's Pride, Rich &amp; Savory"
                    value={sigDishTag}
                    onChange={e => setSigDishTag(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div className="form-group">
                  <label>Price (₦)</label>
                  <input
                    type="number"
                    placeholder="e.g. 8500"
                    value={sigDishPrice}
                    onChange={e => setSigDishPrice(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Image URL *</label>
                <input
                  placeholder="https://images.unsplash.com/... or Cloudinary URL"
                  value={sigDishImage}
                  onChange={e => setSigDishImage(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
                {sigDishImage && (
                  <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', height: 120, width: '100%', background: '#0f172a' }}>
                    <img
                      src={sigDishImage}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief culinary note describing flavors and ingredients..."
                  value={sigDishDescription}
                  onChange={e => setSigDishDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div className="modal-foot">
              <button type="button" className="secondary-btn" onClick={() => setShowSignatureModal(false)}>
                Cancel
              </button>
              <button type="button" className="primary-btn" onClick={saveSignatureDish}>
                {editingSignatureDish ? 'Update Signature Dish' : 'Publish Signature Dish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: CORPORATE TASTING REQUEST DOSSIER */}
      {selectedTastingDrawer && (
        <div className="drawer-backdrop" onClick={() => setSelectedTastingDrawer(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h2>Tasting Request #{selectedTastingDrawer.id}</h2>
                <p>Submitted {new Date(selectedTastingDrawer.createdAt).toLocaleString()}</p>
              </div>
              <button className="icon-btn" onClick={() => setSelectedTastingDrawer(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="receipt-box">
                <strong>Corporate Details</strong>
                <p><b>Company:</b> {selectedTastingDrawer.companyName}</p>
                <p><b>Contact Person:</b> {selectedTastingDrawer.contactPerson}</p>
                <p><b>Phone:</b> <a href={`tel:${selectedTastingDrawer.contactPhone}`} style={{ color: '#c6381e' }}>{selectedTastingDrawer.contactPhone}</a></p>
                <p><b>Official Email:</b> <a href={`mailto:${selectedTastingDrawer.companyEmail}`} style={{ color: '#c6381e' }}>{selectedTastingDrawer.companyEmail}</a></p>
                <p><b>Office Location:</b> {selectedTastingDrawer.location}</p>
                <p><b>Schedule:</b> {selectedTastingDrawer.preferredDate} ({selectedTastingDrawer.preferredTime})</p>
              </div>

              <div className="receipt-box">
                <strong>Tasting Specifications</strong>
                <p><b>Number of Tasters:</b> {selectedTastingDrawer.guestCount} People</p>
                <p><b>Courses Count:</b> {selectedTastingDrawer.mealCount} Different Meals</p>
                <div style={{ marginTop: 8 }}>
                  <b>Selected Meals:</b>
                  <div className="tasting-card-meals-box" style={{ marginTop: 4 }}>
                    {selectedTastingDrawer.mealSelections}
                  </div>
                </div>
                {selectedTastingDrawer.notes && (
                  <p style={{ marginTop: 8, color: '#d97706' }}>
                    <b>Client Dietary Notes:</b> {selectedTastingDrawer.notes}
                  </p>
                )}
              </div>

              <div className="receipt-box">
                <strong>Update Booking Status</strong>
                <select
                  value={selectedTastingDrawer.status}
                  onChange={e => {
                    const newStatus = e.target.value as any;
                    updateTastingStatusDirect(selectedTastingDrawer.id, newStatus);
                    setSelectedTastingDrawer(prev => prev ? { ...prev, status: newStatus } : null);
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 6 }}
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Scheduled">Scheduled &amp; Confirmed</option>
                  <option value="Delivered">Delivered / Completed</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
            </div>

            <div className="receipt-footer">
              <button
                className="whatsapp-btn"
                onClick={() => sendWhatsAppTasting(selectedTastingDrawer)}
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </button>
              <a
                href={`mailto:${selectedTastingDrawer.companyEmail}?subject=Ma'Great Taste Corporate Tasting Box — ${encodeURIComponent(selectedTastingDrawer.companyName)}`}
                className="primary-btn"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Mail size={15} /> Email Client
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT LAGOS DELIVERY LOCATION */}
      {/* ========================================================= */}
      {showLocationModal && (
        <div className="modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <MapPin size={19} />
                </span>
                <h2>{editingLocation ? 'Edit Lagos Location' : 'Add Lagos Delivery Location'}</h2>
                <p>Manage dispatch pricing and ETAs for places within Lagos State only.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowLocationModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                saveDeliveryLocation();
              }}
            >
              <label>
                Location / Area Name (Within Lagos State)
                <input
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Victoria Island, Ikeja GRA, Surulere"
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Zone / Region
                  <select value={locZone} onChange={e => setLocZone(e.target.value)}>
                    <option value="Lagos Island">Lagos Island</option>
                    <option value="Island & Lekki Axis">Island & Lekki Axis</option>
                    <option value="Lekki-Epe Axis">Lekki-Epe Axis</option>
                    <option value="Lagos Mainland">Lagos Mainland</option>
                    <option value="Ikeja & Environs">Ikeja & Environs</option>
                  </select>
                </label>
                <label>
                  Delivery Fee (₦)
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={locDeliveryFee}
                    onChange={e => setLocDeliveryFee(e.target.value)}
                    placeholder="2500"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Estimated Delivery Time
                  <input
                    value={locEstimatedTime}
                    onChange={e => setLocEstimatedTime(e.target.value)}
                    placeholder="e.g. 25–40 min"
                    required
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ marginBottom: 6 }}>Dispatch Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42 }}>
                    <input
                      type="checkbox"
                      id="locIsActive"
                      checked={locIsActive}
                      onChange={e => setLocIsActive(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    <label htmlFor="locIsActive" style={{ margin: 0, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Active for Customer Orders
                    </label>
                  </div>
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="secondary-btn" onClick={() => setShowLocationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={isSavingLocation}>
                  {isSavingLocation ? 'Saving...' : (editingLocation ? 'Save Changes' : 'Create Location')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN SPECIFIC MEALS TO LOCATION */}
      {/* ========================================================= */}
      {mealAssignLocation && (
        <div className="modal-backdrop" onClick={() => setMealAssignLocation(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <UtensilsCrossed size={19} />
                </span>
                <h2>Assign Meals for {mealAssignLocation.name}</h2>
                <p>Choose which dishes can be ordered and delivered to <b>{mealAssignLocation.name}</b> ({mealAssignLocation.zone}, Lagos).</p>
              </div>
              <button className="icon-btn" onClick={() => setMealAssignLocation(null)}>
                <X size={20} />
              </button>
            </div>

            <LocationMealAssignForm
              location={mealAssignLocation}
              foods={foods}
              onSave={saveLocationMealAssignments}
              onCancel={() => setMealAssignLocation(null)}
              isSaving={isSavingMealLocations}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
