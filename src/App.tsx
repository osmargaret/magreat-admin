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
  AlertCircle
} from 'lucide-react';

// Use production Render backend as default
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://magreat-backend.onrender.com/api';
const BACKEND_ROOT = API_BASE.replace(/\/api\/?$/, '');

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
  // If it's a relative path like /meals/akara.jpg
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  // When running in Vercel or locally, try local public folder first
  return cleanPath;
}

const initialFoods: Food[] = [
  { id: 1, name: 'Smoky Party Jollof & Grilled Chicken', category: 'Nigerian', price: 6500, status: 'Available', orders: 142, image: '/meals/smoky-party-jollof-rice.jpg', description: 'Firewood-infused party jollof rice, seasoned grilled chicken, sweet fried dodo plantain & creamy coleslaw', tag: 'Bestseller' },
  { id: 2, name: 'Rich Egusi Soup & Pounded Yam', category: 'Soups & Swallows', price: 7500, status: 'Available', orders: 130, image: '/meals/egusi-soup.png', description: 'Rich melon seed soup simmered with dried catfish, stockfish and tender goat meat.', tag: 'Chef Choice' },
  { id: 3, name: 'Crispy Golden Akara (Bean Cakes)', category: 'Breakfast', price: 2500, status: 'Available', orders: 94, image: '/meals/akara-bean-cake.jpg', description: 'Deep fried golden bean cakes with scotch bonnet peppers, onions and crayfish.', tag: 'Popular' },
  { id: 4, name: 'Authentic Oyo Amala (Yam Flour)', category: 'Soups & Swallows', price: 1800, status: 'Available', orders: 168, image: '/meals/amala.jpg', description: 'Silky smooth yam flour swallow prepared the traditional way.', tag: 'Everyday' },
  { id: 5, name: 'Designer Ayamase (Ofada Pepper Stew)', category: 'Nigerian', price: 7500, status: 'Available', orders: 185, image: '/meals/ayamase-sauce.jpg', description: 'Bleached palm oil green scotch bonnet sauce loaded with assorted meats, boiled egg and locust beans.', tag: 'Bestseller' },
  { id: 6, name: 'Banga Palm Fruit Rice with Seafood', category: 'Nigerian', price: 6800, status: 'Available', orders: 112, image: '/meals/banga-rice.jpg', description: 'Rich Delta palm nut extract infused into long grain rice with dried fish and crayfish.', tag: 'Special' }
];

const initialOrders: Order[] = [
  { id: 'MGT-2116', customer: 'Adaeze Okafor', email: 'adaeze@example.com', phone: '0803 456 7891', address: 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos', item: 'Smoky Party Jollof · 1, Authentic Ghanaian Waakye · 1', items: [{ name: 'Smoky Party Jollof & Chicken', quantity: 1, price: 6500 }, { name: 'Ghanaian Waakye Plate', quantity: 1, price: 5800 }], date: 'Today, 09:21 AM', subtotal: 12300, deliveryFee: 2000, total: 14300, status: 'Delivered', paymentMethod: 'Card (Paystack)', paymentStatus: 'Paid' },
  { id: 'MGT-1048', customer: 'Adaeze Okafor', email: 'adaeze@example.com', phone: '0803 456 7891', address: 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos', item: 'Smoky Party Jollof · 2, Spicy Peppered Asun & Yam · 1', items: [{ name: 'Smoky Party Jollof & Chicken', quantity: 2, price: 6500 }, { name: 'Spicy Peppered Asun & Yam', quantity: 1, price: 6800 }], date: 'Today, 07:59 AM', subtotal: 19800, deliveryFee: 2000, total: 21800, status: 'Delivered', paymentMethod: 'Card', paymentStatus: 'Paid' },
  { id: 'MGT-1047', customer: 'David Akinola', email: 'david@northstar.ng', phone: '0806 912 3345', address: 'Northstar Energy Ltd, 8th Floor, Victoria Island, Lagos', item: 'Smoky Party Jollof · 6, Creamy Herb Chicken Alfredo · 2', items: [{ name: 'Smoky Party Jollof', quantity: 6, price: 6500 }, { name: 'Creamy Herb Chicken Alfredo', quantity: 2, price: 7800 }], date: 'Today, 07:32 AM', subtotal: 54600, deliveryFee: 2000, total: 56600, status: 'Preparing', paymentMethod: 'Corporate Transfer', paymentStatus: 'Paid' },
  { id: 'MGT-1046', customer: 'Zainab Bello', email: 'zainab@gmail.com', phone: '0812 345 6780', address: '12 Isaac John Street, GRA Ikeja, Lagos', item: 'Rich Egusi Soup with Goat Meat & Pounded Yam · 2', items: [{ name: 'Rich Egusi Soup & Pounded Yam', quantity: 2, price: 7500 }], date: 'Today, 06:54 AM', subtotal: 15000, deliveryFee: 1500, total: 16500, status: 'Ready', paymentMethod: 'Card', paymentStatus: 'Paid' },
  { id: 'MGT-1045', customer: 'Chika Nwosu', email: 'chika@outlook.com', phone: '0705 678 1234', address: 'Chevron Tollgate Estate, Lekki, Lagos', item: 'Heritage Ofada Rice & Designer Ayamase · 2', items: [{ name: 'Heritage Ofada Rice', quantity: 2, price: 6200 }], date: 'Today, 05:14 AM', subtotal: 12400, deliveryFee: 1800, total: 14200, status: 'Delivered', paymentMethod: 'Card', paymentStatus: 'Paid' }
];

const initialMealPlans: MealPlanPackage[] = [
  {
    id: 'weekly-essentials',
    name: 'Weekly Essentials',
    meals: '10 meals',
    price: 45000,
    description: 'Ideal for busy professionals who want wholesome dinners throughout the working week.',
    features: ['5 main dishes', '2 soup options', 'Packed & labelled', 'Storage & reheating guide'],
    color: 'mint',
    active: true
  },
  {
    id: 'family-freezer',
    name: 'Family Freezer Pack',
    meals: '20 meals',
    price: 85000,
    description: 'Generous family-sized portions ready to defrost and enjoy anytime.',
    features: ['Family-sized portions', 'Mix of soups & rice', 'Freezer-ready packaging', 'Weekend deliveries'],
    color: 'peach',
    active: true
  },
  {
    id: 'monthly-stockup',
    name: 'Monthly Stock-Up',
    meals: '40 meals',
    price: 165000,
    description: 'Complete peace of mind. We stock your freezer with fresh rotations every week.',
    features: ['4 weekly deliveries', 'Customisable menu', 'Priority delivery slots', 'Complimentary seasonal treat'],
    color: 'lavender',
    active: true
  }
];

const initialCustomers: CustomerRecord[] = [
  {
    id: 'CUST-101',
    name: 'Adaeze Okafor',
    email: 'adaeze@example.com',
    phone: '0803 456 7891',
    ordersCount: 18,
    totalSpent: 168500,
    lastOrderDate: 'Today',
    segment: 'Loyal VIP',
    kitchenNotes: 'Prefers very hot spicy pepper sauce and extra dodo.',
    discount: {
      id: 'DISC-02',
      customerName: 'Adaeze Okafor',
      customerEmail: 'adaeze@example.com',
      type: 'percent',
      value: 10,
      code: 'VIP-ADAEZE10',
      appliesTo: 'individual',
      notes: 'Loyal VIP 10% discount automatically applied',
      active: true,
      createdAt: '2026-10-21'
    }
  },
  {
    id: 'CUST-102',
    name: 'David Akinola',
    email: 'david@northstar.ng',
    phone: '0806 912 3345',
    ordersCount: 9,
    totalSpent: 245000,
    lastOrderDate: 'Today',
    segment: 'Corporate',
    companyName: 'Northstar Energy Ltd',
    kitchenNotes: 'Corporate bulk orders for Friday team lunch. Send VAT invoice.',
    discount: {
      id: 'DISC-01',
      customerName: 'David Akinola',
      customerEmail: 'david@northstar.ng',
      companyName: 'Northstar Energy Ltd',
      type: 'percent',
      value: 15,
      code: 'NORTHSTAR-15',
      appliesTo: 'company',
      notes: '15% corporate catering discount for all Northstar team members',
      active: true,
      createdAt: '2026-10-21'
    }
  },
  {
    id: 'CUST-103',
    name: 'Zainab Bello',
    email: 'zainab@gmail.com',
    phone: '0812 345 6780',
    ordersCount: 12,
    totalSpent: 97500,
    lastOrderDate: 'Today',
    segment: 'Returning',
    kitchenNotes: 'Loves goat meat and fresh pounded yam.'
  },
  {
    id: 'CUST-104',
    name: 'Chika Nwosu',
    email: 'chika@outlook.com',
    phone: '0705 678 1234',
    ordersCount: 7,
    totalSpent: 131000,
    lastOrderDate: 'Today',
    segment: 'Meal plan',
    kitchenNotes: 'Subscribed to 10-meal freezer pack.'
  }
];

const nav: { label: Section; icon: any; group: string; count?: number }[] = [
  { label: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE' },
  { label: 'Orders', icon: ShoppingBag, group: 'WORKSPACE', count: 5 },
  { label: 'Menu management', icon: UtensilsCrossed, group: 'WORKSPACE' },
  { label: 'Catering & events', icon: CalendarDays, group: 'WORKSPACE', count: 3 },
  { label: 'Meal plans', icon: Snowflake, group: 'WORKSPACE' },
  { label: 'Messages', icon: MessageSquare, group: 'ENGAGE', count: 4 },
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [backendOnline, setBackendOnline] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState<any[]>([]);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

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

  const [messages, setMessages] = useState([
    { name: 'Nneka Eze', subject: 'Catering for a 60-person birthday', time: '12 min ago', body: 'Hello, please can I get a quote for a birthday dinner for 60 guests in Lekki on November 8?', unread: true },
    { name: 'Kelechi from Northstar Ltd', subject: 'Corporate lunch subscription', time: '38 min ago', body: 'We are interested in lunch delivery for our team of 25, Monday to Friday.', unread: true },
    { name: 'Tomi Adeyemi', subject: 'Question about freezer meal plans', time: '1 hr ago', body: 'Can I mix different soups and swallows in the monthly package?', unread: true },
    { name: 'Aisha Bello', subject: 'Delivery feedback', time: 'Yesterday', body: 'The food was lovely. Please add more spice options to the order form.', unread: false }
  ]);

  const [cateringLeads, setCateringLeads] = useState<any[]>([
    { id: 'CAT-201', customerName: 'Nneka Eze', eventType: 'Birthday Dinner', guestCount: 60, location: 'Lekki Phase 1, Lagos', eventDate: '2026-11-08', status: 'Quote sent' },
    { id: 'CAT-202', customerName: 'Northstar Ltd', eventType: 'Corporate Lunch', guestCount: 25, location: 'Victoria Island, Lagos', eventDate: '2026-11-02', status: 'Pending' },
    { id: 'CAT-203', customerName: 'Olu & Tobi Adeleke', eventType: 'Wedding Reception', guestCount: 180, location: 'Ikeja GRA, Lagos', eventDate: '2026-12-12', status: 'Confirmed' }
  ]);

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 3200);
  };

  // Cloudinary / Local Image Upload handler
  const handleImageUpload = (file: File) => {
    setUploadingFoodImg(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch(`${API_BASE}/upload`, {
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
        // Fallback to base64 preview
        setFoodImage(base64);
        notify('Photo preview loaded.');
      } finally {
        setUploadingFoodImg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Real-time backend synchronizer
  const loadBackendData = async () => {
    try {
      const [resHealth, resFoods, resOrders, resCatering, resPkgs, resDiscounts] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/menu`),
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/catering`),
        fetch(`${API_BASE}/mealplans/packages`).catch(() => null),
        fetch(`${API_BASE}/discounts`).catch(() => null)
      ]);

      if (resHealth.ok) setBackendOnline(true);
      if (resFoods.ok) {
        const foodData = await resFoods.json();
        if (Array.isArray(foodData) && foodData.length > 0) {
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
      }
      if (resOrders.ok) {
        const orderData = await resOrders.json();
        if (Array.isArray(orderData) && orderData.length > 0) {
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
      }
      if (resCatering && resCatering.ok) {
        const catData = await resCatering.json();
        if (Array.isArray(catData)) setCateringLeads(catData);
      }
      if (resPkgs && resPkgs.ok) {
        const pkgData = await resPkgs.json();
        if (Array.isArray(pkgData) && pkgData.length > 0) setMealPlans(pkgData);
      }
      if (resDiscounts && resDiscounts.ok) {
        const discData = await resDiscounts.json();
        if (Array.isArray(discData) && discData.length > 0) {
          // Merge active discounts into customers state
          setCustomers(prev =>
            prev.map(c => {
              const matched = discData.find(d => d.customerEmail?.toLowerCase() === c.email.toLowerCase() || (c.companyName && d.companyName?.toLowerCase() === c.companyName.toLowerCase()));
              return matched ? { ...c, discount: matched } : c;
            })
          );
        }
      }
      // Load saved meals & dinner reminder subscribers
      fetch(`${API_BASE}/saved-meals`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setSavedCustomers(data);
        })
        .catch(() => {});
    } catch {
      // Offline / standalone fallback
      setBackendOnline(false);
    }
  };

  const sendDinnerReminder = async (id: string, name: string) => {
    setSendingReminderId(id);
    try {
      const res = await fetch(`${API_BASE}/saved-meals/${id}/remind`, { method: 'POST' });
      const data = await res.json();
      notify(`Dinner reminder sent to ${name}!`);
      loadBackendData();
    } catch {
      notify(`Dinner reminder queued for ${name}.`);
    } finally {
      setSendingReminderId(null);
    }
  };

  useEffect(() => {
    loadBackendData();
    const interval = setInterval(loadBackendData, 12000);
    return () => clearInterval(interval);
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
      // UPDATE existing meal
      try {
        const res = await fetch(`${API_BASE}/menu/${editingFood.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          notify(`"${foodName}" updated successfully in live database!`);
          loadBackendData();
        } else {
          throw new Error();
        }
      } catch {
        setFoods(prev => prev.map(f => (f.id === editingFood.id ? { ...f, ...payload } : f)));
        notify(`"${foodName}" updated locally.`);
      }
    } else {
      // CREATE new meal
      try {
        const res = await fetch(`${API_BASE}/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          notify(`"${foodName}" added to the menu! Live on frontend.`);
          loadBackendData();
        } else {
          throw new Error();
        }
      } catch {
        const newDish: Food = {
          id: Date.now(),
          ...payload,
          orders: 0
        };
        setFoods(prev => [newDish, ...prev]);
        notify(`"${foodName}" added to the menu.`);
      }
    }

    setShowAddFood(false);
    setEditingFood(null);
  };

  const toggleFoodStatus = async (f: Food) => {
    const nextStatus = f.status === 'Available' ? 'Sold out' : 'Available';
    try {
      await fetch(`${API_BASE}/menu/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      notify(`${f.name} marked ${nextStatus}.`);
      loadBackendData();
    } catch {
      setFoods(prev => prev.map(item => (item.id === f.id ? { ...item, status: nextStatus } : item)));
      notify(`${f.name} status updated.`);
    }
  };

  const deleteFood = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;
    try {
      await fetch(`${API_BASE}/menu/${id}`, { method: 'DELETE' });
      notify(`"${name}" removed from menu.`);
      loadBackendData();
    } catch {
      setFoods(prev => prev.filter(f => f.id !== id));
      notify(`"${name}" removed locally.`);
    }
  };

  // ==========================================
  // ORDER ACTIONS
  // ==========================================
  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await fetch(`${API_BASE}/orders/${id}/status`, {
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
      try {
        const res = await fetch(`${API_BASE}/mealplans/packages/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          notify(`"${planName}" package updated!`);
          loadBackendData();
        } else {
          throw new Error();
        }
      } catch {
        setMealPlans(prev => prev.map(p => (p.id === editingPlan.id ? { ...p, ...payload } : p)));
        notify(`"${planName}" updated locally.`);
      }
    } else {
      try {
        const res = await fetch(`${API_BASE}/mealplans/packages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          notify(`New package "${planName}" published!`);
          loadBackendData();
        } else {
          throw new Error();
        }
      } catch {
        const newPkg: MealPlanPackage = {
          id: `plan-${Date.now()}`,
          ...payload,
          active: true
        };
        setMealPlans(prev => [...prev, newPkg]);
        notify(`New package "${planName}" created.`);
      }
    }

    setShowPlanModal(false);
    setEditingPlan(null);
  };

  const deleteMealPlan = async (id: string, name: string) => {
    if (!window.confirm(`Delete the "${name}" subscription package?`)) return;
    try {
      await fetch(`${API_BASE}/mealplans/packages/${id}`, { method: 'DELETE' });
      notify(`"${name}" package removed.`);
      loadBackendData();
    } catch {
      setMealPlans(prev => prev.filter(p => p.id !== id));
      notify(`"${name}" package removed.`);
    }
    setShowPlanModal(false);
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
      const res = await fetch(`${API_BASE}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      notify(`Discount code "${payload.code}" (${payload.value}${payload.type === 'percent' ? '%' : '₦'}) assigned!`);

      // Update local state
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
      await fetch(`${API_BASE}/discounts/${cust.discount.id}`, { method: 'DELETE' });
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

  // Add new customer
  const saveNewCustomer = () => {
    if (!newCustName.trim() || !newCustEmail.trim()) {
      notify('Enter customer name and email.');
      return;
    }
    const created: CustomerRecord = {
      id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: newCustName.trim(),
      email: newCustEmail.trim(),
      phone: newCustPhone.trim() || '0800 000 0000',
      companyName: newCustCompany.trim() || undefined,
      ordersCount: 0,
      totalSpent: 0,
      lastOrderDate: 'New Customer',
      segment: newCustSegment
    };
    setCustomers(prev => [created, ...prev]);
    notify(`Customer account for "${newCustName}" created!`);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    setNewCustCompany('');
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
            <img src="/images/logo.jpg" alt="Ma'Great Taste" className="brand-logo-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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
          title={`Backend API: ${API_BASE}`}
          onClick={() => {
            fetch(`${API_BASE}/health`)
              .then(r => r.json())
              .then(d => notify(`Live Render Backend is healthy! (${d.service})`))
              .catch(() => notify('Checking live Render connection...'));
          }}
          style={{ cursor: 'pointer' }}
        >
          <span className={`live-dot ${backendOnline ? 'online' : 'pulse'}`} />
          <div>
            <strong>Main kitchen</strong>
            <small>{backendOnline ? 'Live Render Backend' : 'Connecting to API...'}</small>
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
                  <div className="notif-item" onClick={() => { setSection('Customers'); setShowNotifications(false); }}>
                    <span className="notif-dot gold" />
                    <div>
                      <strong>VIP Customer Discounts Active</strong>
                      <p>Corporate accounts and VIP vouchers ready.</p>
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
                  <button className="popover-link" onClick={() => { notify('Admin session active.'); setShowProfileMenu(false); }}>
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
                OCTOBER 2026 <span>•</span> LAGOS, NIGERIA <span>•</span>{' '}
                <b style={{ color: backendOnline ? '#188363' : '#d99c2b' }}>
                  {backendOnline ? '● BACKEND LIVE (RENDER)' : '○ CONNECTING...'}
                </b>
              </div>
              <h1>
                {section === 'Overview' && 'Good morning, Chef Margaret 👋'}
                {section === 'Orders' && 'Orders Management'}
                {section === 'Menu management' && 'Menu Management'}
                {section === 'Catering & events' && 'Catering & Events'}
                {section === 'Meal plans' && 'Meal Plans & Subscriptions'}
                {section === 'Messages' && 'Customer Messages'}
                {section === 'Saved meals & reminders' && 'Saved Meals & Automated Dinner Reminders'}
                {section === 'Analytics' && 'Business Analytics'}
                {section === 'Customers' && 'Customers Directory & Discounts'}
                {section === 'Settings' && 'Store Settings'}
              </h1>
              <p>
                {section === 'Overview' && 'Here is what’s cooking at Ma’Great Taste today.'}
                {section === 'Orders' && 'Track and fulfil incoming orders from the website and delivery dispatch.'}
                {section === 'Menu management' && 'Add dishes, update pricing, upload dish photos, and manage availability.'}
                {section === 'Catering & events' && 'Manage high-value catering leads, corporate bookings, and wedding quotes.'}
                {section === 'Meal plans' && 'Create and edit meal prep packages and freezer stocking subscriptions.'}
                {section === 'Customers' && 'Manage individual VIPs, corporate companies, assign discounts and vouchers.'}
              </p>
            </div>

            <div className="heading-actions">
              <button className="secondary-btn" onClick={loadBackendData} title="Refresh real-time data">
                <Clock3 size={15} /> Refresh data
              </button>
              {section === 'Menu management' && (
                <button className="primary-btn" onClick={openAddFoodModal}>
                  <Plus size={16} /> Add menu item
                </button>
              )}
              {section === 'Meal plans' && (
                <button className="primary-btn" onClick={openCreatePlanModal}>
                  <Plus size={16} /> Create plan
                </button>
              )}
              {section === 'Customers' && (
                <button className="primary-btn" onClick={() => setShowAddCustomerModal(true)}>
                  <Plus size={16} /> Add customer / company
                </button>
              )}
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
                <div className="welcome-illustration">
                  <div className="plate">
                    <span>🍲</span>
                  </div>
                  <div className="banner-stat">
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
                  <p>Gross revenue (30 days)</p>
                  <strong className="stat-value">₦3,485,000</strong>
                  <div className="stat-bottom">
                    <small>Across takeaway & catering</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon orange">
                      <ShoppingBag />
                    </div>
                    <span className="stat-change up">{orders.length} orders</span>
                  </div>
                  <p>Total orders fulfilled</p>
                  <strong className="stat-value">{orders.length + 142}</strong>
                  <div className="stat-bottom">
                    <small>98.4% on-time delivery</small>
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
                    <small>Valued at ₦1.8M+</small>
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
                    <small>Northstar, Adaeze & VIPs</small>
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
                    <strong>₦1,248,500</strong>
                    <small>Past 7 days online revenue</small>
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
                      <h3>Sales by category</h3>
                      <p>Top ordered Nigerian dishes</p>
                    </div>
                    <button className="dots-btn" onClick={() => setSection('Menu management')}>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <div className="donut-wrap">
                    <div className="donut">
                      <div>
                        <strong>{orders.length + 80}</strong>
                        <small>Total meals</small>
                      </div>
                    </div>
                  </div>
                  <div className="category-list">
                    <div className="category-row">
                      <span className="category-name">
                        <i style={{ background: '#c6381e' }} /> Nigerian Rice & Stews
                      </span>
                      <strong>52%</strong>
                    </div>
                    <div className="category-row">
                      <span className="category-name">
                        <i style={{ background: '#d99c2b' }} /> Traditional Soups & Swallows
                      </span>
                      <strong>26%</strong>
                    </div>
                    <div className="category-row">
                      <span className="category-name">
                        <i style={{ background: '#3f6e8e' }} /> Continental & Grills
                      </span>
                      <strong>14%</strong>
                    </div>
                    <div className="category-row">
                      <span className="category-name">
                        <i style={{ background: '#182838' }} /> Breakfast & Small Chops
                      </span>
                      <strong>8%</strong>
                    </div>
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
                    <button className="quick-action" onClick={() => setSection('Meal plans')}>
                      <div className="quick-icon blue">
                        <Snowflake size={18} />
                      </div>
                      <div>
                        <strong>Manage meal plans</strong>
                        <small>Edit freezer subscriptions</small>
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
                  <button className="attention-row" onClick={() => setSection('Customers')}>
                    <span className="attention-icon blue">
                      <Building size={17} />
                    </span>
                    <span>
                      <strong>Corporate VIP Accounts</strong>
                      <small>Northstar Energy & Corporate staff perks</small>
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
                      <button
                        className="food-more"
                        onClick={() => toggleFoodStatus(f)}
                        title="Click to toggle Available / Sold out"
                      >
                        <MoreHorizontal size={18} />
                      </button>
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
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 4. CATERING & EVENTS */}
          {/* ========================================================= */}
          {section === 'Catering & events' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div>
                  <h3>High-Volume Catering Leads</h3>
                  <p className="muted">Incoming wedding, corporate, and private party requests.</p>
                </div>
                <button className="secondary-btn" onClick={loadBackendData}>
                  <Filter size={15} /> Refresh leads
                </button>
              </div>
              <div className="event-cards">
                {cateringLeads.map((c, idx) => (
                  <div className="event-card" key={c.id || idx}>
                    <div className="event-top">
                      <div className="event-emoji">🍲</div>
                      <span className={`status ${c.status === 'Confirmed' ? 'status-green' : c.status === 'Quote sent' ? 'status-amber' : 'status-red'}`}>
                        {c.status || 'Pending'}
                      </span>
                    </div>
                    <h3>{c.eventType || 'Event Catering'}</h3>
                    <strong>{c.customerName || 'Client'}</strong>
                    <p>{c.guestCount || 50} guests · {c.location || 'Lagos, Nigeria'}</p>
                    <div className="event-date">
                      <CalendarDays size={14} />
                      <span>{c.eventDate || 'Upcoming date'}</span>
                      <button
                        className="quote-cycle-btn"
                        onClick={() => {
                          const next = c.status === 'Pending' ? 'Quote sent' : c.status === 'Quote sent' ? 'Confirmed' : 'Pending';
                          fetch(`${API_BASE}/catering/${c.id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: next })
                          }).then(() => {
                            notify(`Lead status updated to ${next}`);
                            loadBackendData();
                          });
                        }}
                      >
                        Advance status ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
          {/* 6. CUSTOMERS DIRECTORY & DISCOUNTS (INDIVIDUAL & COMPANY) */}
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
                <button className="secondary-btn" onClick={downloadReport}>
                  <Download size={15} /> Export customers
                </button>
              </div>

              <div className="table-wrap">
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
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 7. SAVED MEALS & DINNER REMINDERS */}
          {/* ========================================================= */}
          {section === 'Saved meals & reminders' && (
            <section className="panel content-panel">
              <div className="panel-head">
                <div>
                  <h3>Customer Saved Meals & Automated Dinner Reminders</h3>
                  <p>Send personalized reminders to customer inboxes to trigger instant dinner orders.</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>EMAIL & PHONE</th>
                      <th>SAVED MEALS</th>
                      <th>REMINDER STATUS</th>
                      <th>SENT COUNT</th>
                      <th>DISPATCH REMINDER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedCustomers.map((c: any) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.customerName}</strong>
                        </td>
                        <td>
                          <span>{c.customerEmail}</span>
                          <small className="subline">{c.customerPhone || '0800 000 0000'}</small>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', maxWidth: 300 }}>
                            {(c.items || []).map((m: any, idx: number) => (
                              <span key={idx} className="saved-dish-tag">
                                🍲 {m.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="status status-green">{c.reminderStatus || 'Active'}</span>
                        </td>
                        <td>{c.reminderCount || 0} times</td>
                        <td>
                          <button
                            className="primary-btn"
                            disabled={sendingReminderId === c.id}
                            onClick={() => sendDinnerReminder(c.id, c.customerName)}
                          >
                            <Mail size={13} /> {sendingReminderId === c.id ? 'Sending...' : 'Send Reminder'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                {messages.map((m, idx) => (
                  <div className={`message-item ${m.unread ? 'message-unread' : ''}`} key={idx}>
                    <div className="message-avatar">{m.name[0]}</div>
                    <div className="message-preview">
                      <div>
                        <strong>{m.name}</strong>
                        <small>{m.time}</small>
                      </div>
                      <b>{m.subject}</b>
                      <p>{m.body}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="panel message-detail">
                <div className="message-detail-empty">
                  <div className="detail-icon">
                    <MessageSquare size={26} />
                  </div>
                  <h3>Select a conversation</h3>
                  <p>Choose an enquiry from the left to read customer requirements and send a quotation.</p>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. ANALYTICS */}
          {/* ========================================================= */}
          {section === 'Analytics' && (
            <div className="stat-grid">
              <div className="stat-card">
                <strong className="stat-value">₦4,280,000</strong>
                <p>Quarterly Total Revenue</p>
              </div>
              <div className="stat-card">
                <strong className="stat-value">₦18,500</strong>
                <p>Average Order Value</p>
              </div>
              <div className="stat-card">
                <strong className="stat-value">4.9 / 5.0</strong>
                <p>Customer Satisfaction Rating</p>
              </div>
              <div className="stat-card">
                <strong className="stat-value">84%</strong>
                <p>Returning Customer Rate</p>
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
                    <p>Details displayed on receipts and dispatch dockets</p>
                  </div>
                </div>
                <label>
                  Business Name
                  <input defaultValue="Ma’Great Taste Restaurant & Catering Services" />
                </label>
                <label>
                  Head Kitchen Address
                  <input defaultValue="Lekki Phase 1, Lagos, Nigeria" />
                </label>
                <label>
                  Contact Phone & WhatsApp
                  <input defaultValue="+234 803 456 7890" />
                </label>
                <label>
                  Email Address
                  <input defaultValue="orders@magreattaste.ng" />
                </label>
                <button className="primary-btn" onClick={() => notify('Settings saved.')}>
                  Save changes
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
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="toggle-row">
                  <div>
                    <strong>Instant WhatsApp kitchen alerts</strong>
                    <small>Forward new order alerts to chef phone</small>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="toggle-row">
                  <div>
                    <strong>Corporate discounts enabled</strong>
                    <small>Allow company promo codes at checkout</small>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

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
              {/* Target Type */}
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

              {/* Quick Preset Buttons */}
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
              {/* Customer Box */}
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

              {/* Items Breakdown */}
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

              {/* Status Update Quick Buttons */}
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
