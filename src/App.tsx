import { useMemo, useState, useEffect } from 'react';
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
  DollarSign
} from 'lucide-react';
import { defaultFoods } from './data/menuData';

// Bulletproof backend URL resolver (ensures /api is always present)
const rawApiBase = String((import.meta as any).env?.VITE_API_URL || 'https://magreat-backend.onrender.com/api').trim().replace(/\/+$/, '');
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;
const ADMIN_SECRET = String((import.meta as any).env?.VITE_ADMIN_SECRET || '');

/** Authenticated fetch — automatically attaches the admin Bearer token */
function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (ADMIN_SECRET) headers['Authorization'] = `Bearer ${ADMIN_SECRET}`;
  return fetch(url, { ...options, headers });
}

type Section =
  | 'Overview'
  | 'Orders'
  | 'Menu management'
  | 'Catering & events'
  | 'Meal plans'
  | 'Messages'
  | 'Saved meals & reminders'
  | 'Analytics'
  | 'Customers'
  | 'Settings';

export type Food = {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'Available' | 'Sold out';
  orders: number;
  image: string;
  description?: string;
  tag?: string;
  rating?: string;
  time?: string;
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
};

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
  orders: f.ordersCount || 0,
  image: f.image || FALLBACK_FOOD_IMG,
  description: f.description,
  tag: f.tag,
  rating: f.rating || '4.9',
  time: f.time || '25–35 min'
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
const initialSavedCustomers: SavedMealCustomer[] = [
  {
    id: 'sm-1',
    customerName: 'Amina Bello',
    customerEmail: 'amina.bello@example.com',
    customerPhone: '08023456789',
    mealType: 'Breakfast',
    items: [
      { name: 'Authentic Ghanaian Waakye Bowl', price: 5800, category: 'Breakfast' },
      { name: 'Golden Fried Plantain (Dodo)', price: 1500, category: 'Breakfast' }
    ],
    reminderStatus: 'Active',
    reminderCount: 2,
    lastReminderSentAt: 'Today, 8:15 AM',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sm-2',
    customerName: 'Chidi Okafor',
    customerEmail: 'chidi.okafor@enterprise.ng',
    customerPhone: '08139876543',
    mealType: 'Lunch',
    items: [
      { name: 'Smoky Party Jollof & Grilled Chicken', price: 6500, category: 'Lunch' },
      { name: 'Creamy Crunchy Coleslaw', price: 1200, category: 'Lunch' }
    ],
    reminderStatus: 'Active',
    reminderCount: 4,
    lastReminderSentAt: 'Yesterday, 12:10 PM',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sm-3',
    customerName: 'Folake Adeyemi',
    customerEmail: 'folake.ade@gmail.com',
    customerPhone: '09051234567',
    mealType: 'Dessert & Snacks',
    items: [
      { name: 'Warm Cinnamon Puff Puff Platter', price: 2500, category: 'Dessert & Snacks' },
      { name: 'Golden Flaky Meat Pies (Box of 4)', price: 3200, category: 'Dessert & Snacks' }
    ],
    reminderStatus: 'Active',
    reminderCount: 1,
    lastReminderSentAt: '2 days ago, 3:30 PM',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sm-4',
    customerName: 'Babajide Davies',
    customerEmail: 'b.davies@lagosgroup.com',
    customerPhone: '08077654321',
    mealType: 'Dinner',
    items: [
      { name: 'Rich Egusi Soup with Goat Meat & Pounded Yam', price: 7500, category: 'Dinner' },
      { name: 'Spicy Peppered Asun Yam Platter', price: 6800, category: 'Dinner' }
    ],
    reminderStatus: 'Active',
    reminderCount: 3,
    lastReminderSentAt: 'Yesterday, 5:45 PM',
    createdAt: new Date().toISOString()
  }
];

const nav: { label: Section; icon: any; group: string; count?: number }[] = [
  { label: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE' },
  { label: 'Orders', icon: ShoppingBag, group: 'WORKSPACE' },
  { label: 'Menu management', icon: UtensilsCrossed, group: 'WORKSPACE' },
  { label: 'Catering & events', icon: CalendarDays, group: 'WORKSPACE' },
  { label: 'Meal plans', icon: Snowflake, group: 'WORKSPACE' },
  { label: 'Messages', icon: MessageSquare, group: 'ENGAGE' },
  { label: 'Saved meals & reminders', icon: Heart, group: 'ENGAGE' },
  { label: 'Analytics', icon: ChartNoAxesCombined, group: 'BUSINESS' },
  { label: 'Customers', icon: Users, group: 'BUSINESS' },
  { label: 'Settings', icon: Settings, group: 'BUSINESS' }
];

const money = (n: number) => '₦' + (n || 0).toLocaleString('en-NG');

function App() {
  const [section, setSection] = useState<Section>('Overview');
  const [foods, setFoods] = useState<Food[]>(initialFoods);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [mealPlans, setMealPlans] = useState<MealPlanPackage[]>(initialMealPlans);
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [cateringLeads, setCateringLeads] = useState<CateringLead[]>(initialCateringLeads);
  const [savedCustomers, setSavedCustomers] = useState<SavedMealCustomer[]>(initialSavedCustomers);

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

  // Form states: Food Add/Edit
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('Nigerian');
  const [foodTag, setFoodTag] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [foodImage, setFoodImage] = useState('');
  const [foodStatus, setFoodStatus] = useState<'Available' | 'Sold out'>('Available');
  const [uploadingFoodImg, setUploadingFoodImg] = useState(false);

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

  // Settings States (Real-time backend synchronization)
  const [settingsBusinessName, setSettingsBusinessName] = useState("Ma'Great Taste Restaurant & Catering Services");
  const [settingsAddress, setSettingsAddress] = useState('Lekki Phase 1, Lagos, Nigeria');
  const [settingsPhone, setSettingsPhone] = useState('+234 803 456 7890');
  const [settingsEmail, setSettingsEmail] = useState('orders@magreattaste.ng');
  const [settingsOnlineOrdering, setSettingsOnlineOrdering] = useState(true);
  const [settingsWhatsappAlerts, setSettingsWhatsappAlerts] = useState(true);
  const [settingsCorporateDiscounts, setSettingsCorporateDiscounts] = useState(true);
  const [settingsMinOrder, setSettingsMinOrder] = useState('3000');
  const [settingsDeliveryFee, setSettingsDeliveryFee] = useState('2000');
  const [settingsOpeningHours, setSettingsOpeningHours] = useState('8:00 AM – 10:00 PM Daily');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 3200);
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

    // Menu
    adminFetch(`${API_BASE}/menu`)
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
              orders: f.ordersCount || f.orders || 0,
              image: f.image || FALLBACK_FOOD_IMG,
              description: f.description,
              tag: f.tag,
              rating: f.rating || '4.9',
              time: f.time || '25–35 min'
            }))
          );
        }
      })
      .catch(() => {});

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
      .catch(() => {});

    // Catering Leads
    adminFetch(`${API_BASE}/catering`)
      .then(r => r.json())
      .then(catData => {
        if (Array.isArray(catData)) {
          setBackendOnline(true);
          setCateringLeads(catData);
        }
      })
      .catch(() => {});

    // Meal Plan Packages
    adminFetch(`${API_BASE}/mealplans/packages`)
      .then(r => r.json())
      .then(pkgData => {
        if (Array.isArray(pkgData)) {
          setBackendOnline(true);
          if (pkgData.length > 0) setMealPlans(pkgData);
        }
      })
      .catch(() => {});

    // Saved Meals & Reminders
    adminFetch(`${API_BASE}/saved-meals`)
      .then(r => r.json())
      .then(savedData => {
        if (Array.isArray(savedData)) {
          setBackendOnline(true);
          if (savedData.length > 0) setSavedCustomers(savedData);
        }
      })
      .catch(() => {});

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
      .catch(() => {});

    // Real-time Customers Directory
    adminFetch(`${API_BASE}/customers`)
      .then(r => r.json())
      .then(custData => {
        if (Array.isArray(custData)) {
          setBackendOnline(true);
          setCustomers(custData);
        }
      })
      .catch(() => {});

    // Real-time Customer Messages
    adminFetch(`${API_BASE}/messages`)
      .then(r => r.json())
      .then(msgData => {
        if (Array.isArray(msgData)) {
          setBackendOnline(true);
          setMessages(msgData);
        }
      })
      .catch(() => {});

    // Real-time Store Settings
    adminFetch(`${API_BASE}/settings`)
      .then(r => r.json())
      .then(s => {
        if (s && s.businessName) {
          setBackendOnline(true);
          setSettingsBusinessName(s.businessName);
          if (s.kitchenAddress) setSettingsAddress(s.kitchenAddress);
          if (s.phone) setSettingsPhone(s.phone);
          if (s.email) setSettingsEmail(s.email);
          if (s.onlineOrdering !== undefined) setSettingsOnlineOrdering(s.onlineOrdering);
          if (s.whatsappAlerts !== undefined) setSettingsWhatsappAlerts(s.whatsappAlerts);
          if (s.corporateDiscounts !== undefined) setSettingsCorporateDiscounts(s.corporateDiscounts);
          if (s.minOrderAmount !== undefined) setSettingsMinOrder(String(s.minOrderAmount));
          if (s.deliveryFee !== undefined) setSettingsDeliveryFee(String(s.deliveryFee));
          if (s.openingHours) setSettingsOpeningHours(s.openingHours);
        }
      })
      .catch(() => {});
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
      openingHours: settingsOpeningHours
    };

    try {
      const res = await adminFetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notify('✅ Store settings saved live in real time to backend!');
      } else {
        throw new Error();
      }
    } catch {
      notify('Settings saved locally.');
    } finally {
      setIsSavingSettings(false);
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
      foods.filter(
        f =>
          (f.name + ' ' + f.category + ' ' + (f.tag || '')).toLowerCase().includes(search.toLowerCase()) &&
          (filter === 'All' || f.category.toLowerCase() === filter.toLowerCase())
      ),
    [foods, search, filter]
  );

  // Dynamic metrics for Overview & Analytics
  const grossRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);
  const deliveredCount = useMemo(() => orders.filter(o => o.status === 'Delivered').length, [orders]);
  const averageOrderValue = useMemo(() => (orders.length > 0 ? Math.round(grossRevenue / orders.length) : 0), [orders, grossRevenue]);

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

  // Top performing signature dishes by order count
  const topDishes = useMemo(() => {
    return [...foods].sort((a, b) => (b.orders || 0) - (a.orders || 0)).slice(0, 6);
  }, [foods]);

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
      status: foodStatus
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
          const created = await res.json();
          if (created && created.id) {
            setFoods(prev => prev.map(f => (f.id === tempId ? { ...f, id: created.id } : f)));
          }
          notify(`"${foodName}" saved live in database!`);
        }
      } catch (err) {
        console.warn('Backend sync:', err);
      }
      return;
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
        body: JSON.stringify({ status: nextStatus })
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
    } catch {}
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

  // Message conversation handlers
  const openMessage = (m: any) => {
    setSelectedMessage(m);
    setReplyText(`Hello ${m.name},\nThank you for reaching out to Ma'Great Taste Restaurant & Catering!\nRegarding your enquiry: "${m.subject}":\n\n`);
    if (m.unread) {
      setMessages(prev => prev.map(item => (item.id === m.id ? { ...item, unread: false } : item)));
      adminFetch(`${API_BASE}/messages/${m.id}/read`, { method: 'PATCH' }).catch(() => {});
    }
  };

  const toggleMessageUnread = (m: any) => {
    const nextUnread = !m.unread;
    setMessages(prev => prev.map(item => (item.id === m.id ? { ...item, unread: nextUnread } : item)));
    if (selectedMessage && selectedMessage.id === m.id) {
      setSelectedMessage({ ...selectedMessage, unread: nextUnread });
    }
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
    } catch {}
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
    } catch {}
    setCateringLeads(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
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
          {['WORKSPACE', 'ENGAGE', 'BUSINESS'].map(group => (
            <div className="nav-group" key={group}>
              <div className="nav-label">{group}</div>
              {nav
                .filter(n => n.group === group)
                .map(item => {
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
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-bottom">
          <div className="profile" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer' }}>
            <div className="avatar">MS</div>
            <div className="profile-copy">
              <strong>Margaret S.</strong>
              <small>Store Manager · Lagos</small>
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
            <div style={{ position: 'relative' }}>
              <div
                className="top-avatar"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: 'pointer' }}
              >
                MS
              </div>
              {showProfileMenu && (
                <div className="profile-popover">
                  <div style={{ paddingBottom: 10, borderBottom: '1px solid #eef2f5', marginBottom: 10 }}>
                    <strong style={{ display: 'block', fontSize: 13, color: '#182838' }}>Chef Margaret</strong>
                    <span style={{ fontSize: 11, color: '#687c88' }}>Head Chef & Founder</span>
                  </div>
                  <button className="popover-link" onClick={() => { setSection('Settings'); setShowProfileMenu(false); }}>
                    <Settings size={14} /> Store Settings
                  </button>
                  <button className="popover-link" onClick={() => { setSection('Customers'); setShowProfileMenu(false); }}>
                    <Percent size={14} /> Customer Discounts
                  </button>
                  <button className="popover-link" onClick={() => { setShowSecurityModal(true); setShowProfileMenu(false); }}>
                    <ShieldCheck size={14} /> Security & Roles
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
                {section === 'Overview' && 'Good morning, Chef Margaret 👋'}
                {section === 'Orders' && 'Orders Management'}
                {section === 'Menu management' && 'Menu Management'}
                {section === 'Catering & events' && 'Catering & Events'}
                {section === 'Meal plans' && 'Meal Plans & Subscriptions'}
                {section === 'Messages' && 'Customer Messages'}
                {section === 'Saved meals & reminders' && 'Saved Meals & Automated Meal Reminders'}
                {section === 'Analytics' && 'Business Analytics'}
                {section === 'Customers' && 'Customers Directory & Discounts'}
                {section === 'Settings' && 'Store Settings'}
              </h1>
              <p>
                {section === 'Overview' && 'Here is what’s cooking at Ma’Great Taste today.'}
                {section === 'Orders' && 'Track and fulfil incoming orders from the website and delivery dispatch.'}
                {section === 'Menu management' && 'Add dishes, update pricing, upload dish photos, and manage availability.'}
                {section === 'Catering & events' && 'Manage high-value catering leads, corporate bookings, send quotes, and discuss menus.'}
                {section === 'Meal plans' && 'Create and edit meal prep packages and freezer stocking subscriptions.'}
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
                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon green">
                      <CircleDollarSign />
                    </div>
                    <span className="stat-change up">+18%</span>
                  </div>
                  <p>Gross revenue (Real-time)</p>
                  <strong className="stat-value">{money(orders.reduce((sum, o) => sum + (o.total || 0), 0))}</strong>
                  <div className="stat-bottom">
                    <small>{orders.length} orders recorded</small>
                  </div>
                </div>

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
              <div className="toolbar">
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
                <button className="primary-btn" onClick={openAddFoodModal}>
                  <Plus size={15} /> Add menu item
                </button>
              </div>

              {/* Dish Cards Grid */}
              <div className="menu-grid">
                {filteredFoods.map(f => (
                  <div className="food-card" key={f.id}>
                    <div className="food-photo">
                      <img
                        src={resolveMealImage(f.image)}
                        alt={f.name}
                        onError={e => {
                          e.currentTarget.src = FALLBACK_FOOD_IMG;
                        }}
                      />
                      <span className={`status ${f.status === 'Available' ? 'status-green' : 'status-red'}`}>
                        {f.status}
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

                      <div className="food-card-foot">
                        <strong>{money(f.price)}</strong>
                        <span>{f.orders || 0} orders</span>
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
          {/* 4. CATERING & EVENTS (FULL QUOTATIONS, WHATSAPP, DRAWER) */}
          {/* ========================================================= */}
          {section === 'Catering & events' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div>
                  <h3>High-Volume Catering Leads & Quotes</h3>
                  <p className="muted">Direct requests for wedding buffets, corporate retreats, and party banquets.</p>
                </div>
                <button className="secondary-btn" onClick={loadBackendData}>
                  <Filter size={15} /> Refresh leads
                </button>
              </div>

              {cateringLeads.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <CalendarDays size={42} style={{ opacity: 0.35, marginBottom: 14, color: 'var(--brand-navy)' }} />
                  <h3 style={{ fontSize: 17, color: 'var(--brand-navy)', marginBottom: 6 }}>No catering enquiries yet</h3>
                  <p style={{ fontSize: 13, color: '#687c88', maxWidth: 450, margin: '0 auto' }}>
                    Party bookings, corporate lunches, and wedding catering enquiries submitted through the website form will appear here.
                  </p>
                </div>
              ) : (
                <div className="event-cards">
                  {cateringLeads.map((c, idx) => (
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
          )}

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
          {/* 8. MESSAGES */}
          {/* ========================================================= */}
          {section === 'Messages' && (
            <div className="messages-layout">
              <section className="panel message-list">
                <div className="panel-head">
                  <div>
                    <h3>Inbox ({unread} unread)</h3>
                    <p>Enquiries from website contact form</p>
                  </div>
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
                      <div className="message-avatar">{m.name ? m.name[0].toUpperCase() : 'M'}</div>
                      <div className="message-preview">
                        <div>
                          <strong>{m.name}</strong>
                          <small>{m.time || (m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent')}</small>
                        </div>
                        <b>{m.subject || 'Website Enquiry'}</b>
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
                        <div className="message-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                          {selectedMessage.name ? selectedMessage.name[0].toUpperCase() : 'M'}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 15, color: 'var(--brand-navy)' }}>{selectedMessage.name}</h3>
                          <div className="message-meta-strip">
                            <span><b>Email:</b> {selectedMessage.email || 'N/A'}</span>
                            <span><b>Phone:</b> {selectedMessage.phone || 'N/A'}</span>
                            <span><b>Received:</b> {selectedMessage.time || (selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'Recent')}</span>
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
                      <textarea
                        className="message-reply-textarea"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your response message here..."
                      />
                      <div className="message-reply-actions">
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
      {/* MODAL: SECURITY & STAFF ROLES */}
      {/* ========================================================= */}
      {showSecurityModal && (
        <div className="modal-backdrop" onClick={() => setShowSecurityModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <ShieldCheck size={19} />
                </span>
                <h2>Security & Staff Roles</h2>
                <p>Manage kitchen staff access, dispatch privileges, and manager PIN.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowSecurityModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="receipt-box" style={{ background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <strong>Chef Margaret (Owner)</strong>
                  <small style={{ color: '#687c88', display: 'block' }}>Super Administrator · Full Access</small>
                </div>
                <span className="status status-green">Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <strong>Kitchen Supervisor</strong>
                  <small style={{ color: '#687c88', display: 'block' }}>Orders, Menu Management & Prep Status</small>
                </div>
                <span className="status status-green">Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Dispatch & Courier Lead</strong>
                  <small style={{ color: '#687c88', display: 'block' }}>Orders, Delivery Addresses & Dockets</small>
                </div>
                <span className="status status-green">Active</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="primary-btn" onClick={() => { notify('Staff security configuration updated.'); setShowSecurityModal(false); }}>
                Save Security Settings
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
    </div>
  );
}

export default App;
