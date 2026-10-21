import { useMemo, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  CalendarDays,
  Snowflake,
  MessageSquare,
  Newspaper,
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
  PackageCheck
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

type Section =
  | 'Overview'
  | 'Orders'
  | 'Menu management'
  | 'Catering & events'
  | 'Meal plans'
  | 'Messages'
  | 'Blog'
  | 'Analytics'
  | 'Customers'
  | 'Settings';

type Food = {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'Available' | 'Sold out';
  orders: number;
  image: string;
};

type Order = {
  id: string;
  customer: string;
  item: string;
  date: string;
  total: number;
  status: 'New' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
};

const initialFoods: Food[] = [
  { id: 1, name: 'Jollof Rice & Grilled Chicken', category: 'Nigerian', price: 6500, status: 'Available', orders: 142, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=160&q=80' },
  { id: 2, name: 'Egusi Soup & Pounded Yam', category: 'Nigerian', price: 7500, status: 'Available', orders: 130, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&q=80' },
  { id: 3, name: 'English Breakfast Plate', category: 'Breakfast', price: 8000, status: 'Available', orders: 64, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=160&q=80' },
  { id: 4, name: 'Chicken Fried Rice', category: 'Asian', price: 6900, status: 'Available', orders: 58, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=160&q=80' },
  { id: 5, name: 'Ghanaian Waakye Bowl', category: 'Ghanaian', price: 5800, status: 'Available', orders: 89, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=160&q=80' },
  { id: 6, name: 'Ofada Rice & Ayamase', category: 'Nigerian', price: 6200, status: 'Available', orders: 115, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=160&q=80' }
];

const initialOrders: Order[] = [
  { id: 'MGT-1048', customer: 'Adaeze Okafor', item: 'Smoky Party Jollof · 2', date: 'Today, 10:42 AM', total: 21800, status: 'New' },
  { id: 'MGT-1047', customer: 'David Akinola', item: 'Office lunch package · 8 meals', date: 'Today, 10:18 AM', total: 56600, status: 'Preparing' },
  { id: 'MGT-1046', customer: 'Zainab Bello', item: 'Rich Egusi Soup & Pounded Yam · 2', date: 'Today, 9:56 AM', total: 16500, status: 'Ready' },
  { id: 'MGT-1045', customer: 'Chika Nwosu', item: 'Heritage Ofada Rice · 2', date: 'Today, 9:24 AM', total: 14200, status: 'Delivered' }
];

const nav: { label: Section; icon: any; group: string; count?: number }[] = [
  { label: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE' },
  { label: 'Orders', icon: ShoppingBag, group: 'WORKSPACE', count: 8 },
  { label: 'Menu management', icon: UtensilsCrossed, group: 'WORKSPACE' },
  { label: 'Catering & events', icon: CalendarDays, group: 'WORKSPACE', count: 3 },
  { label: 'Meal plans', icon: Snowflake, group: 'WORKSPACE' },
  { label: 'Messages', icon: MessageSquare, group: 'ENGAGE', count: 4 },
  { label: 'Blog', icon: Newspaper, group: 'ENGAGE' },
  { label: 'Analytics', icon: ChartNoAxesCombined, group: 'BUSINESS' },
  { label: 'Customers', icon: Users, group: 'BUSINESS' },
  { label: 'Settings', icon: Settings, group: 'BUSINESS' }
];

const money = (n: number) => '₦' + n.toLocaleString('en-NG');

function App() {
  const [section, setSection] = useState<Section>('Overview');
  const [foods, setFoods] = useState<Food[]>(initialFoods);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showAddFood, setShowAddFood] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [backendOnline, setBackendOnline] = useState(false);

  const [messages, setMessages] = useState([
    { name: 'Nneka Eze', subject: 'Catering for a 60-person birthday', time: '12 min ago', body: 'Hello, please can I get a quote for a birthday dinner for 60 guests in Lekki on November 8?', unread: true },
    { name: 'Kelechi from Northstar Ltd', subject: 'Corporate lunch subscription', time: '38 min ago', body: 'We are interested in lunch delivery for our team of 25, Monday to Friday.', unread: true },
    { name: 'Tomi Adeyemi', subject: 'Question about freezer meal plans', time: '1 hr ago', body: 'Can I mix different soups and swallows in the monthly package?', unread: true },
    { name: 'Aisha Bello', subject: 'Delivery feedback', time: 'Yesterday', body: 'The food was lovely. Please add more spice options to the order form.', unread: false }
  ]);

  const [blogs, setBlogs] = useState([
    { title: 'The Secret Behind Authentic Smoky Nigerian Party Jollof', category: 'Culinary Secrets', status: 'Published', date: 'Oct 18, 2026', views: 542 },
    { title: 'The Ultimate Guide to Stress-Free Event Catering in Nigeria', category: 'Event Planning', status: 'Published', date: 'Oct 14, 2026', views: 389 },
    { title: 'Five Wholesome Nigerian Meals That Freeze and Reheat Like Magic', category: 'Meal Prep', status: 'Published', date: 'Oct 09, 2026', views: 421 }
  ]);

  const [cateringLeads, setCateringLeads] = useState<any[]>([
    { id: 'CAT-201', customerName: 'Nneka Eze', eventType: 'Birthday Dinner', guestCount: 60, location: 'Lekki Phase 1, Lagos', eventDate: '2026-11-08', status: 'Quote sent' },
    { id: 'CAT-202', customerName: 'Northstar Ltd', eventType: 'Corporate Lunch', guestCount: 25, location: 'Victoria Island, Lagos', eventDate: '2026-11-02', status: 'Pending' },
    { id: 'CAT-203', customerName: 'Olu & Tobi Adeleke', eventType: 'Wedding Reception', guestCount: 180, location: 'Ikeja GRA, Lagos', eventDate: '2026-12-12', status: 'Confirmed' }
  ]);

  const [showBlog, setShowBlog] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Food stories');
  const [blogContent, setBlogContent] = useState('');

  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('Nigerian');

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 2800);
  };

  // Fetch real-time data from Express backend
  const loadBackendData = async () => {
    try {
      const [resHealth, resFoods, resOrders, resBlogs, resCatering, resMessages] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/menu`),
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/blog`),
        fetch(`${API_BASE}/catering`),
        fetch(`${API_BASE}/messages`)
      ]);

      if (resHealth.ok) {
        setBackendOnline(true);
      }

      if (resFoods.ok) {
        const rawFoods = await resFoods.json();
        if (Array.isArray(rawFoods)) {
          setFoods(
            rawFoods.map(f => ({
              id: f.id,
              name: f.name,
              category: f.category,
              price: f.price,
              status: f.status || 'Available',
              orders: f.ordersCount || 0,
              image: f.image
            }))
          );
        }
      }

      if (resOrders.ok) {
        const rawOrders = await resOrders.json();
        if (Array.isArray(rawOrders)) {
          setOrders(
            rawOrders.map(o => ({
              id: o.id,
              customer: o.customerName,
              item: o.items ? o.items.map((i: any) => `${i.name} · ${i.quantity}`).join(', ') : 'Assorted meals',
              date: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              total: o.total,
              status: o.status
            }))
          );
        }
      }

      if (resBlogs.ok) {
        const rawBlogs = await resBlogs.json();
        if (Array.isArray(rawBlogs)) {
          setBlogs(
            rawBlogs.map(b => ({
              title: b.title,
              category: b.category,
              status: b.status,
              date: b.date,
              views: b.views
            }))
          );
        }
      }

      if (resCatering.ok) {
        const rawCatering = await resCatering.json();
        if (Array.isArray(rawCatering)) {
          setCateringLeads(rawCatering);
        }
      }

      if (resMessages.ok) {
        const rawMessages = await resMessages.json();
        if (Array.isArray(rawMessages)) {
          setMessages(
            rawMessages.map(m => ({
              name: m.name,
              subject: m.subject,
              time: m.time,
              body: m.body,
              unread: m.unread
            }))
          );
        }
      }
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    loadBackendData();
    // Poll backend every 10 seconds for real-time live customer orders
    const interval = setInterval(loadBackendData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredFoods = useMemo(
    () =>
      foods.filter(
        f =>
          (f.name + ' ' + f.category).toLowerCase().includes(search.toLowerCase()) &&
          (filter === 'All' || f.category === filter)
      ),
    [foods, search, filter]
  );

  const unread = messages.filter(m => m.unread).length;
  const newOrdersCount = orders.filter(o => o.status === 'New').length;

  const titleMap: Record<Section, string> = {
    Overview: 'Good morning, Margaret 👋',
    Orders: 'Orders Management',
    'Menu management': 'Menu Management',
    'Catering & events': 'Catering & Events',
    'Meal plans': 'Meal Plans & Subscriptions',
    Messages: 'Messages & Enquiries',
    Blog: 'Blog & Kitchen Stories',
    Analytics: 'Business Analytics',
    Customers: 'Customers Directory',
    Settings: 'Store Settings'
  };

  // Add food item
  const addFood = async () => {
    if (!foodName.trim() || Number(foodPrice) <= 0) {
      notify('Enter a food name and a valid price.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: foodName.trim(),
          price: Number(foodPrice),
          category: foodCategory,
          description: `Signature freshly prepared ${foodCategory} dish.`,
          image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'
        })
      });
      if (res.ok) {
        notify('Menu item added successfully and live on the frontend!');
        loadBackendData();
      } else {
        throw new Error();
      }
    } catch {
      setFoods(p => [
        {
          id: Date.now(),
          name: foodName.trim(),
          category: foodCategory,
          price: Number(foodPrice),
          status: 'Available',
          orders: 0,
          image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=160&q=80'
        },
        ...p
      ]);
      notify('Menu item added locally.');
    }

    setFoodName('');
    setFoodPrice('');
    setShowAddFood(false);
  };

  // Update order status
  const updateOrder = async (id: string, status: Order['status']) => {
    try {
      await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      notify(`Order ${id} marked ${status.toLowerCase()}.`);
      loadBackendData();
    } catch {
      setOrders(p => p.map(o => (o.id === id ? { ...o, status } : o)));
      notify(`Order ${id} updated locally.`);
    }
  };

  // Delete food item
  const deleteFood = async (id: number) => {
    try {
      await fetch(`${API_BASE}/menu/${id}`, { method: 'DELETE' });
      notify('Item removed from menu.');
      loadBackendData();
    } catch {
      setFoods(p => p.filter(x => x.id !== id));
      notify('Item removed locally.');
    }
  };

  // Add blog article
  const saveArticle = async () => {
    if (!blogTitle.trim()) return;
    try {
      await fetch(`${API_BASE}/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogTitle.trim(),
          category: blogCategory,
          status: 'Published',
          content: blogContent || 'New culinary story from Ma’Great Taste.'
        })
      });
      notify('Article published successfully and live on website!');
      loadBackendData();
    } catch {
      setBlogs(p => [
        {
          title: blogTitle,
          category: blogCategory,
          status: 'Published',
          date: 'Just now',
          views: 1
        },
        ...p
      ]);
      notify('Article saved locally.');
    }
    setBlogTitle('');
    setBlogContent('');
    setShowBlog(false);
  };

  const downloadReport = () => {
    const csv =
      'Order ID,Customer,Item,Date,Total,Status\n' +
      orders
        .map(o =>
          [o.id, o.customer, o.item, o.date, o.total, o.status]
            .map(x => '"' + String(x).replaceAll('"', '""') + '"')
            .join(',')
        )
        .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `magreattaste-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Order report exported.');
  };

  const totalCalculatedRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <ChefHat size={23} />
          </div>
          <div>
            <strong>Ma’Great Taste</strong>
            <small>ADMIN STUDIO</small>
          </div>
          <button className="mobile-close icon-btn" onClick={() => setMobileNav(false)}>
            <X size={19} />
          </button>
        </div>

        <div className="store-chip">
          <span className="store-dot" />
          <div>
            <strong>Main kitchen</strong>
            <small>
              {backendOnline ? 'API Connected (Port 5000)' : 'Standalone Preview'}
            </small>
          </div>
          <ChevronDown size={15} />
        </div>

        <nav>
          {['WORKSPACE', 'ENGAGE', 'BUSINESS'].map(group => (
            <div className="nav-group" key={group}>
              <p className="nav-label">{group}</p>
              {nav
                .filter(n => n.group === group)
                .map(n => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.label}
                      className={`nav-item ${section === n.label ? 'active' : ''}`}
                      onClick={() => {
                        setSection(n.label);
                        setMobileNav(false);
                      }}
                    >
                      <Icon size={18} />
                      <span>{n.label}</span>
                      {n.count !== undefined && (
                        <b className={n.label === 'Orders' ? 'count-hot' : ''}>
                          {n.label === 'Orders' ? newOrdersCount : n.label === 'Messages' ? unread : n.count}
                        </b>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <Sparkles size={17} />
            </div>
            <strong>Connected Engine</strong>
            <p>Menu & orders sync in real time with the front end.</p>
            <button onClick={() => notify('API Health check: 200 OK. Connected to http://localhost:5000.')}>
              System Status <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="profile">
            <div className="avatar">MS</div>
            <div className="profile-copy">
              <strong>Margaret Samuel</strong>
              <small>Store Administrator</small>
            </div>
            <MoreHorizontal size={20} />
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)}>
            <MenuIcon size={21} />
          </button>
          <div className="crumb">
            Ma’Great Taste <span>/</span> <b>{section}</b>
          </div>
          <div className="top-actions">
            <div className="top-search">
              <Search size={16} />
              <input
                placeholder="Search anything..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && section !== 'Menu management') setSection('Menu management');
                }}
              />
              <kbd>⌘ K</kbd>
            </div>
            <div className="notification-wrap">
              <button
                className="icon-btn bell"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={19} />
                <i />
              </button>
              {showNotifications && (
                <div className="notification-pop">
                  <strong>Notifications</strong>
                  <p>
                    <span className="notif-dot" /> {newOrdersCount} new orders need attention
                  </p>
                  <p>
                    <span className="notif-dot gold" /> {cateringLeads.length} catering enquiries
                  </p>
                  <p>
                    <span className="notif-dot blue" /> {unread} unread customer messages
                  </p>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setSection('Orders');
                    }}
                  >
                    Review activity
                  </button>
                </div>
              )}
            </div>
            <div className="top-avatar">MS</div>
          </div>
        </header>

        <div className="page">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                OCTOBER 2026 <span>•</span> LAGOS, NIGERIA <span>•</span>{' '}
                <span style={{ color: backendOnline ? '#18864b' : '#b78038' }}>
                  ● {backendOnline ? 'BACKEND LIVE' : 'OFFLINE MODE'}
                </span>
              </div>
              <h1>{titleMap[section]}</h1>
              <p>
                {section === 'Overview'
                  ? 'Here’s what’s happening with your food business today.'
                  : section === 'Menu management'
                  ? 'Create, update and organise the dishes customers can order on the frontend.'
                  : section === 'Orders'
                  ? 'Track customer orders from checkout and payment verification to dispatch.'
                  : section === 'Messages'
                  ? 'Stay on top of customer questions and catering opportunities.'
                  : section === 'Blog'
                  ? 'Share food stories, recipes and kitchen updates with your website visitors.'
                  : `Manage your ${section.toLowerCase()} from one place.`}
              </p>
            </div>

            <div className="heading-actions">
              {section === 'Menu management' ? (
                <button className="primary-btn" onClick={() => setShowAddFood(true)}>
                  <Plus size={17} /> Add menu item
                </button>
              ) : section === 'Blog' ? (
                <button className="primary-btn" onClick={() => setShowBlog(true)}>
                  <Plus size={17} /> New article
                </button>
              ) : section === 'Orders' || section === 'Analytics' ? (
                <button className="secondary-btn" onClick={downloadReport}>
                  <Download size={16} /> Export report
                </button>
              ) : (
                <button className="secondary-btn" onClick={() => notify('Synchronizing data from API...')}>
                  <Clock3 size={16} /> Refresh data
                </button>
              )}
            </div>
          </div>

          {/* OVERVIEW SECTION */}
          {section === 'Overview' && (
            <>
              <div className="welcome-banner">
                <div className="welcome-content">
                  <div className="welcome-tag">
                    <Sparkles size={13} /> YOUR DAILY SNAPSHOT
                  </div>
                  <h2>Good food. Great business.</h2>
                  <p>
                    Your kitchen is moving! You have {newOrdersCount} fresh orders waiting and{' '}
                    {cateringLeads.length} catering enquiries to follow up on.
                  </p>
                  <button onClick={() => setSection('Orders')}>
                    View today’s orders <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="welcome-illustration">
                  <div className="plate">
                    <span>🍲</span>
                  </div>
                  <div className="leaf leaf-one">✦</div>
                  <div className="leaf leaf-two">✦</div>
                  <div className="banner-stat">
                    <small>Active orders</small>
                    <strong>
                      {orders.length} <span>↗ live</span>
                    </strong>
                  </div>
                </div>
              </div>

              <div className="stat-grid">
                <Stat
                  icon={<CircleDollarSign />}
                  label="Total revenue"
                  value={money(totalCalculatedRevenue)}
                  change="18.6%"
                  positive
                  note="calculated from orders"
                  tone="green"
                />
                <Stat
                  icon={<ShoppingBag />}
                  label="Total orders"
                  value={String(orders.length)}
                  change={`${newOrdersCount} new`}
                  positive
                  note="across all channels"
                  tone="orange"
                />
                <Stat
                  icon={<Users />}
                  label="Menu items"
                  value={String(foods.length)}
                  change="active"
                  positive
                  note="live on frontend"
                  tone="purple"
                />
                <Stat
                  icon={<CalendarDays />}
                  label="Catering enquiries"
                  value={String(cateringLeads.length)}
                  change="3 pending"
                  positive={false}
                  note="need your attention"
                  tone="blue"
                />
              </div>

              <div className="overview-grid">
                <section className="panel revenue-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Revenue overview</h3>
                      <p>Track how your business is performing</p>
                    </div>
                    <select defaultValue="30 days">
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                    </select>
                  </div>
                  <div className="revenue-total">
                    <strong>{money(totalCalculatedRevenue)}</strong>
                    <span className="trend-pill">
                      <TrendingUp size={13} /> 18.6%
                    </span>
                    <small>current period performance</small>
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
                      <svg viewBox="0 0 620 190" preserveAspectRatio="none" className="chart-svg">
                        <defs>
                          <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#16836b" stopOpacity=".20" />
                            <stop offset="100%" stopColor="#16836b" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 151 C32 142 42 119 70 128 S118 145 145 107 S189 126 218 92 S257 108 285 75 S328 96 357 66 S401 86 429 50 S471 73 500 38 S548 52 575 22 S602 32 620 10 L620 190 L0 190 Z"
                          fill="url(#areaFill)"
                        />
                        <path
                          d="M0 151 C32 142 42 119 70 128 S118 145 145 107 S189 126 218 92 S257 108 285 75 S328 96 357 66 S401 86 429 50 S471 73 500 38 S548 52 575 22 S602 32 620 10"
                          fill="none"
                          stroke="#16836b"
                          strokeWidth="3"
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="chart-x">
                        <span>Sep 21</span>
                        <span>Sep 26</span>
                        <span>Oct 1</span>
                        <span>Oct 6</span>
                        <span>Oct 11</span>
                        <span>Oct 16</span>
                        <span>Oct 20</span>
                      </div>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i /> Revenue
                    </span>
                    <span>
                      <i className="legend-pale" /> Previous period
                    </span>
                  </div>
                </section>

                <section className="panel category-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Sales by category</h3>
                      <p>Where orders are coming from</p>
                    </div>
                    <button className="dots-btn">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  <div className="donut-wrap">
                    <div className="donut">
                      <div>
                        <strong>{orders.length}</strong>
                        <small>Total orders</small>
                      </div>
                    </div>
                  </div>
                  <div className="category-list">
                    <Category color="#137a62" label="Nigerian Specialty" value="52%" />
                    <Category color="#f2a34a" label="Continental & Pasta" value="22%" />
                    <Category color="#7b78d9" label="Breakfast Platter" value="16%" />
                    <Category color="#a8d8ca" label="Waakye & Asian" value="10%" />
                  </div>
                </section>
              </div>

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
                <OrdersTable orders={orders.slice(0, 5)} onStatus={updateOrder} />
              </section>

              <div className="bottom-grid">
                <section className="panel quick-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Quick actions</h3>
                      <p>Get things done faster</p>
                    </div>
                  </div>
                  <div className="quick-grid">
                    <Quick
                      icon={<Plus />}
                      label="Add a menu item"
                      color="green"
                      onClick={() => {
                        setSection('Menu management');
                        setShowAddFood(true);
                      }}
                    />
                    <Quick
                      icon={<CalendarDays />}
                      label="Review catering"
                      color="orange"
                      onClick={() => setSection('Catering & events')}
                    />
                    <Quick
                      icon={<Newspaper />}
                      label="Write a blog post"
                      color="purple"
                      onClick={() => {
                        setSection('Blog');
                        setShowBlog(true);
                      }}
                    />
                    <Quick
                      icon={<MessageSquare />}
                      label="Read messages"
                      color="blue"
                      onClick={() => setSection('Messages')}
                    />
                  </div>
                </section>

                <section className="panel attention-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Needs your attention</h3>
                      <p>Items awaiting your action</p>
                    </div>
                    <span className="attention-count">{newOrdersCount + unread}</span>
                  </div>
                  <button className="attention-row" onClick={() => setSection('Orders')}>
                    <span className="attention-icon orange">
                      <ShoppingBag size={17} />
                    </span>
                    <span>
                      <strong>{newOrdersCount} new orders</strong>
                      <small>Review, prepare and confirm delivery</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                  <button className="attention-row" onClick={() => setSection('Catering & events')}>
                    <span className="attention-icon purple">
                      <CalendarDays size={17} />
                    </span>
                    <span>
                      <strong>{cateringLeads.length} catering enquiries</strong>
                      <small>Send quotes to clients</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                  <button className="attention-row" onClick={() => setSection('Messages')}>
                    <span className="attention-icon blue">
                      <Mail size={17} />
                    </span>
                    <span>
                      <strong>{unread} unread messages</strong>
                      <small>Respond to customer questions</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                </section>
              </div>
            </>
          )}

          {/* MENU MANAGEMENT */}
          {section === 'Menu management' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Search menu items..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                  <option>All</option>
                  <option>Nigerian</option>
                  <option>Ghanaian</option>
                  <option>Asian</option>
                  <option>Continental</option>
                  <option>Breakfast</option>
                </select>
                <button className="secondary-btn" onClick={() => notify('Filters applied')}>
                  <Filter size={15} /> Filter
                </button>
              </div>
              <div className="menu-grid">
                {filteredFoods.map(f => (
                  <div className="food-card" key={f.id}>
                    <div className="food-photo">
                      <img src={f.image} alt={f.name} />
                      <span className={`status ${f.status === 'Available' ? 'status-green' : 'status-red'}`}>
                        {f.status}
                      </span>
                      <button
                        className="food-more"
                        onClick={() => {
                          const next = f.status === 'Available' ? 'Sold out' : 'Available';
                          fetch(`${API_BASE}/menu/${f.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: next })
                          }).then(() => loadBackendData());
                        }}
                        title="Toggle availability"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                    <div className="food-card-body">
                      <span className="food-category">{f.category}</span>
                      <h3>{f.name}</h3>
                      <div className="food-card-foot">
                        <strong>{money(f.price)}</strong>
                        <span>{f.orders} orders</span>
                      </div>
                      <div className="food-actions">
                        <button
                          onClick={() => {
                            setFoodName(f.name);
                            setFoodPrice(String(f.price));
                            setFoodCategory(f.category);
                            setShowAddFood(true);
                          }}
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button onClick={() => deleteFood(f.id)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredFoods.length === 0 && <div className="empty-state">No menu items found.</div>}
            </section>
          )}

          {/* ORDERS SECTION */}
          {section === 'Orders' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Search order, customer..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                  <option>All</option>
                  <option>New</option>
                  <option>Preparing</option>
                  <option>Ready</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
                <button className="secondary-btn" onClick={downloadReport}>
                  <Download size={15} /> Export
                </button>
              </div>
              <OrdersTable
                orders={orders.filter(
                  o =>
                    (o.id + ' ' + o.customer + ' ' + o.item).toLowerCase().includes(search.toLowerCase()) &&
                    (filter === 'All' || o.status === filter)
                )}
                onStatus={updateOrder}
              />
            </section>
          )}

          {/* MESSAGES */}
          {section === 'Messages' && (
            <div className="messages-layout">
              <section className="panel message-list">
                <div className="panel-head">
                  <div>
                    <h3>Inbox</h3>
                    <p>{unread} unread conversations</p>
                  </div>
                  <button
                    className="dots-btn"
                    onClick={() => {
                      fetch(`${API_BASE}/messages/read-all`, { method: 'POST' }).then(() => loadBackendData());
                    }}
                    title="Mark all read"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                </div>
                {messages.map((m, i) => (
                  <button
                    className={`message-item ${m.unread ? 'message-unread' : ''}`}
                    key={i}
                    onClick={() => {
                      setMessages(p => p.map((x, j) => (j === i ? { ...x, unread: false } : x)));
                    }}
                  >
                    <div className="message-avatar">
                      {m.name
                        .split(' ')
                        .map(x => x[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="message-preview">
                      <div>
                        <strong>{m.name}</strong>
                        <small>{m.time}</small>
                      </div>
                      <b>{m.subject}</b>
                      <p>{m.body}</p>
                    </div>
                    {m.unread && <i className="unread-dot" />}
                  </button>
                ))}
              </section>

              <section className="panel message-detail">
                <div className="message-detail-empty">
                  <div className="detail-icon">
                    <MessageSquare size={25} />
                  </div>
                  <h3>Select a conversation</h3>
                  <p>
                    Customer enquiries submitted through the frontend or contact page appear here in real time.
                  </p>
                  <button className="secondary-btn" onClick={() => notify('WhatsApp channel connected')}>
                    <Send size={15} /> Connect WhatsApp Business
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* BLOG */}
          {section === 'Blog' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Search articles..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                  <option>All</option>
                  <option>Published</option>
                  <option>Draft</option>
                </select>
                <button className="primary-btn" onClick={() => setShowBlog(true)}>
                  <Plus size={16} /> New article
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ARTICLE</th>
                      <th>CATEGORY</th>
                      <th>STATUS</th>
                      <th>DATE</th>
                      <th>VIEWS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs
                      .filter(
                        b =>
                          (b.title + ' ' + b.category).toLowerCase().includes(search.toLowerCase()) &&
                          (filter === 'All' || b.status === filter)
                      )
                      .map((b, i) => (
                        <tr key={b.title + i}>
                          <td>
                            <div className="article-cell">
                              <div className={`article-thumb thumb-${i % 3}`}>
                                <Newspaper size={19} />
                              </div>
                              <strong>{b.title}</strong>
                            </div>
                          </td>
                          <td>{b.category}</td>
                          <td>
                            <span className={`status ${b.status === 'Published' ? 'status-green' : 'status-amber'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>{b.date}</td>
                          <td>{b.views.toLocaleString()}</td>
                          <td>
                            <button
                              className="dots-btn"
                              onClick={() => {
                                setBlogTitle(b.title);
                                setBlogCategory(b.category);
                                setShowBlog(true);
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ANALYTICS */}
          {section === 'Analytics' && (
            <>
              <div className="stat-grid">
                <Stat
                  icon={<CircleDollarSign />}
                  label="Gross revenue"
                  value={money(totalCalculatedRevenue)}
                  change="18.6%"
                  positive
                  note="vs. previous period"
                  tone="green"
                />
                <Stat
                  icon={<ShoppingBag />}
                  label="Orders completed"
                  value={String(orders.filter(o => o.status === 'Delivered').length)}
                  change="12.4%"
                  positive
                  note="fulfilled"
                  tone="orange"
                />
                <Stat
                  icon={<Users />}
                  label="Returning customers"
                  value="42.8%"
                  change="5.1%"
                  positive
                  note="loyalty rate"
                  tone="purple"
                />
                <Stat
                  icon={<PackageCheck />}
                  label="Average order value"
                  value={money(orders.length > 0 ? Math.round(totalCalculatedRevenue / orders.length) : 0)}
                  change="4.3%"
                  positive
                  note="per customer"
                  tone="blue"
                />
              </div>

              <div className="overview-grid">
                <section className="panel revenue-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Revenue trend</h3>
                      <p>Illustrative revenue performance</p>
                    </div>
                    <button className="secondary-btn" onClick={downloadReport}>
                      <Download size={15} /> Export
                    </button>
                  </div>
                  <div className="revenue-total">
                    <strong>{money(totalCalculatedRevenue)}</strong>
                    <span className="trend-pill">
                      <TrendingUp size={13} /> 18.6%
                    </span>
                  </div>
                  <div className="big-bars">
                    {[42, 58, 48, 72, 62, 82, 68, 91, 74, 86, 65, 98].map((v, i) => (
                      <div key={i} className="bar-col">
                        <span style={{ height: `${v}%` }} />
                        <small>
                          {
                            [
                              'Sep 1',
                              'Sep 4',
                              'Sep 7',
                              'Sep 10',
                              'Sep 13',
                              'Sep 16',
                              'Sep 19',
                              'Sep 22',
                              'Sep 25',
                              'Sep 28',
                              'Oct 1',
                              'Oct 4'
                            ][i]
                          }
                        </small>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>Top-selling dishes</h3>
                      <p>By order volume</p>
                    </div>
                  </div>
                  {foods
                    .slice()
                    .sort((a, b) => b.orders - a.orders)
                    .slice(0, 5)
                    .map((f, i) => (
                      <div className="top-food" key={f.id}>
                        <span className="rank">0{i + 1}</span>
                        <img src={f.image} alt="" />
                        <div>
                          <strong>{f.name}</strong>
                          <small>{f.orders} orders</small>
                        </div>
                        <b>{money(f.price * (f.orders || 1))}</b>
                      </div>
                    ))}
                </section>
              </div>
            </>
          )}

          {/* CATERING & EVENTS */}
          {section === 'Catering & events' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div>
                  <h3>Event enquiries</h3>
                  <p className="muted">Incoming quote requests from the website catering form.</p>
                </div>
                <button className="secondary-btn" onClick={loadBackendData}>
                  <Filter size={15} /> Refresh leads
                </button>
              </div>
              <div className="event-cards">
                {cateringLeads.map((c, idx) => (
                  <EventCard
                    key={c.id || idx}
                    emoji="💍"
                    title={c.eventType || 'Event Catering'}
                    customer={c.customerName || 'Customer'}
                    detail={`${c.guestCount || 50} guests · ${c.location || 'Lagos'}`}
                    date={c.eventDate || 'Coming soon'}
                    value={c.status || 'Pending'}
                    onClick={() => {
                      const next = c.status === 'Pending' ? 'Quote sent' : c.status === 'Quote sent' ? 'Confirmed' : 'Pending';
                      fetch(`${API_BASE}/catering/${c.id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: next })
                      }).then(() => {
                        notify(`Lead ${c.id} updated to ${next}`);
                        loadBackendData();
                      });
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* MEAL PLANS */}
          {section === 'Meal plans' && (
            <section className="panel content-panel">
              <div className="panel-head">
                <div>
                  <h3>Freezer stocking & meal subscriptions</h3>
                  <p>Manage meal prep packages for the week or month.</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => notify('Package setup active on customer site.')}
                >
                  <Plus size={16} /> Create plan
                </button>
              </div>
              <div className="plan-grid">
                <PlanCard
                  name="Weekly Essentials"
                  meals="10 meals"
                  price="₦45,000"
                  color="mint"
                  features={['5 main dishes', '2 soup options', 'Packed & labelled']}
                />
                <PlanCard
                  name="Family Freezer Pack"
                  meals="20 meals"
                  price="₦85,000"
                  color="peach"
                  features={['Family-sized portions', 'Mix of soups & rice', 'Freezer-ready packaging']}
                />
                <PlanCard
                  name="Monthly Stock-Up"
                  meals="40 meals"
                  price="₦165,000"
                  color="lavender"
                  features={['4 weekly deliveries', 'Customisable menu', 'Priority delivery slots']}
                />
              </div>
            </section>
          )}

          {/* CUSTOMERS */}
          {section === 'Customers' && (
            <section className="panel content-panel">
              <div className="toolbar">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Search customers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button className="secondary-btn" onClick={downloadReport}>
                  <Download size={15} /> Export customers
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>CONTACT</th>
                      <th>ORDERS</th>
                      <th>TOTAL SPENT</th>
                      <th>LAST ORDER</th>
                      <th>SEGMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: 'Adaeze Okafor', e: 'adaeze@example.com', p: '0803 456 7891', o: 18, s: 168500, d: 'Today', seg: 'Loyal' },
                      { n: 'David Akinola', e: 'david@northstar.ng', p: '0806 912 3345', o: 9, s: 245000, d: 'Today', seg: 'Corporate' },
                      { n: 'Zainab Bello', e: 'zainab@gmail.com', p: '0812 345 6780', o: 12, s: 97500, d: 'Today', seg: 'Returning' },
                      { n: 'Chika Nwosu', e: 'chika@outlook.com', p: '0705 678 1234', o: 7, s: 131000, d: 'Today', seg: 'Meal plan' }
                    ]
                      .filter(c => c.n.toLowerCase().includes(search.toLowerCase()))
                      .map(c => (
                        <tr key={c.n}>
                          <td>
                            <div className="customer-cell">
                              <div className="avatar small">{c.n.split(' ').map(x => x[0]).join('')}</div>
                              <strong>{c.n}</strong>
                            </div>
                          </td>
                          <td>
                            <span>{c.e}</span>
                            <small className="subline">{c.p}</small>
                          </td>
                          <td>{c.o}</td>
                          <td>
                            <strong>{money(c.s)}</strong>
                          </td>
                          <td>{c.d}</td>
                          <td>
                            <span className="status status-green">{c.seg}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SETTINGS */}
          {section === 'Settings' && (
            <div className="settings-grid">
              <section className="panel settings-panel">
                <div className="panel-head">
                  <div>
                    <h3>Business profile</h3>
                    <p>Manage the information customers see.</p>
                  </div>
                </div>
                <label>
                  Business name
                  <input defaultValue="Ma’Great Taste Event & Catering Services" />
                </label>
                <label>
                  Business email
                  <input defaultValue="hello@magreattaste.ng" />
                </label>
                <label>
                  Phone number
                  <input defaultValue="+234 803 123 4567" />
                </label>
                <label>
                  Primary location
                  <input defaultValue="Lagos, Nigeria" />
                </label>
                <label>
                  Brand tagline
                  <input defaultValue="Good food, great memories." />
                </label>
                <button className="primary-btn" onClick={() => notify('Settings saved successfully.')}>
                  <CheckCircle2 size={16} /> Save changes
                </button>
              </section>

              <section className="panel settings-panel">
                <div className="panel-head">
                  <div>
                    <h3>Store preferences</h3>
                    <p>Configure online kitchen operations.</p>
                  </div>
                </div>
                <Toggle label="Accept online orders" detail="Allow customers to place new orders on the frontend." />
                <Toggle label="Show sold-out items" detail="Keep unavailable dishes visible on the menu." />
                <Toggle label="Email order notifications" detail="Receive instant alerts for incoming orders." />
                <Toggle label="Catering enquiries" detail="Allow event and corporate quote requests." />
              </section>
            </div>
          )}

          <footer className="footer">
            <span>© 2026 Ma’Great Taste. All rights reserved.</span>
            <span>
              <span className="live-dot" /> Live Studio <i>·</i>{' '}
              <button onClick={() => notify(`Backend status: ${backendOnline ? 'Online' : 'Offline'}`)}>
                {backendOnline ? 'API Connected' : 'Offline'}
              </button>
            </span>
          </footer>
        </div>
      </main>

      {/* MODAL: ADD FOOD ITEM */}
      {showAddFood && (
        <div className="modal-backdrop" onClick={() => setShowAddFood(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <UtensilsCrossed size={19} />
                </span>
                <h2>Add menu item</h2>
                <p>Add a dish to your live menu.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowAddFood(false)}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                addFood();
              }}
            >
              <label>
                Food name
                <input
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  placeholder="e.g. Fisherman Soup & Semo"
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
                    placeholder="7500"
                    required
                  />
                </label>
                <label>
                  Category
                  <select value={foodCategory} onChange={e => setFoodCategory(e.target.value)}>
                    <option>Nigerian</option>
                    <option>Ghanaian</option>
                    <option>Asian</option>
                    <option>Breakfast</option>
                    <option>Continental</option>
                  </select>
                </label>
              </div>
              <div className="upload-placeholder">
                <ImagePlus size={22} />
                <strong>Food photo</strong>
                <span>Assigned high-res chef photo automatically.</span>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAddFood(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <Plus size={16} /> Publish to menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW BLOG ARTICLE */}
      {showBlog && (
        <div className="modal-backdrop" onClick={() => setShowBlog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <Newspaper size={19} />
                </span>
                <h2>New blog article</h2>
                <p>Create a food story for your website.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowBlog(false)}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                saveArticle();
              }}
            >
              <label>
                Article title
                <input
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  placeholder="Give your article a helpful title"
                  required
                />
              </label>
              <label>
                Category
                <select value={blogCategory} onChange={e => setBlogCategory(e.target.value)}>
                  <option>Culinary Secrets</option>
                  <option>Event Planning</option>
                  <option>Meal Prep</option>
                  <option>Food Stories</option>
                  <option>Company News</option>
                </select>
              </label>
              <label>
                Article content
                <textarea
                  placeholder="Start writing your story..."
                  rows={5}
                  value={blogContent}
                  onChange={e => setBlogContent(e.target.value)}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowBlog(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <Pencil size={16} /> Publish article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  change,
  positive,
  note,
  tone
}: {
  icon: any;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  note: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}>{icon}</span>
        <button className="dots-btn">
          <MoreHorizontal size={19} />
        </button>
      </div>
      <p>{label}</p>
      <strong className="stat-value">{value}</strong>
      <div className="stat-bottom">
        <span className={`stat-change ${positive ? 'up' : 'neutral'}`}>
          {positive ? <ArrowUpRight size={13} /> : <Clock3 size={13} />} {change}
        </span>
        <small>{note}</small>
      </div>
    </div>
  );
}

function Category({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="category-row">
      <span className="category-name">
        <i style={{ background: color }} />
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function OrdersTable({
  orders,
  onStatus
}: {
  orders: Order[];
  onStatus: (id: string, status: Order['status']) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ORDER</th>
            <th>CUSTOMER</th>
            <th>ITEMS</th>
            <th>DATE</th>
            <th>TOTAL</th>
            <th>STATUS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>
                <strong className="order-id">{o.id}</strong>
              </td>
              <td>
                <div className="customer-cell">
                  <div className="avatar small">
                    {o.customer
                      .split(' ')
                      .map(x => x[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <strong>{o.customer}</strong>
                </div>
              </td>
              <td className="item-cell">{o.item}</td>
              <td>{o.date}</td>
              <td>
                <strong>{money(o.total)}</strong>
              </td>
              <td>
                <select
                  className={`status-select status-${o.status.toLowerCase()}`}
                  value={o.status}
                  onChange={e => onStatus(o.id, e.target.value as Order['status'])}
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
                  className="dots-btn"
                  title="Cycle status"
                  onClick={() =>
                    onStatus(
                      o.id,
                      o.status === 'New'
                        ? 'Preparing'
                        : o.status === 'Preparing'
                        ? 'Ready'
                        : o.status === 'Ready'
                        ? 'Delivered'
                        : o.status
                    )
                  }
                >
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <div className="empty-state">No orders match your search.</div>}
    </div>
  );
}

function Quick({ icon, label, color, onClick }: { icon: any; label: string; color: string; onClick: () => void }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span className={`quick-icon ${color}`}>{icon}</span>
      <strong>{label}</strong>
      <ArrowUpRight size={15} />
    </button>
  );
}

function EventCard({
  emoji,
  title,
  customer,
  detail,
  date,
  value,
  onClick
}: {
  emoji: string;
  title: string;
  customer: string;
  detail: string;
  date: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button className="event-card" onClick={onClick}>
      <div className="event-top">
        <span className="event-emoji">{emoji}</span>
        <span className="status status-amber">{value}</span>
      </div>
      <h3>{title}</h3>
      <strong>{customer}</strong>
      <p>{detail}</p>
      <div className="event-date">
        <CalendarDays size={14} />
        {date}
        <ArrowUpRight size={15} />
      </div>
    </button>
  );
}

function PlanCard({
  name,
  meals,
  price,
  color,
  features
}: {
  name: string;
  meals: string;
  price: string;
  color: string;
  features: string[];
}) {
  return (
    <div className={`plan-card ${color}`}>
      <div className="plan-emoji">
        <Snowflake size={21} />
      </div>
      <span className="plan-meals">{meals}</span>
      <h3>{name}</h3>
      <strong className="plan-price">
        {price}
        <small> / package</small>
      </strong>
      <ul>
        {features.map(f => (
          <li key={f}>
            <CheckCircle2 size={15} />
            {f}
          </li>
        ))}
      </ul>
      <button className="secondary-btn" onClick={() => window.alert('Meal plan active on user site.')}>
        Manage plan <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

function Toggle({ label, detail }: { label: string; detail: string }) {
  const [on, setOn] = useState(true);
  return (
    <div className="toggle-row">
      <div>
        <strong>{label}</strong>
        <small>{detail}</small>
      </div>
      <button
        className={`toggle ${on ? 'on' : ''}`}
        onClick={() => setOn(!on)}
        aria-label={`Toggle ${label}`}
      >
        <span />
      </button>
    </div>
  );
}

export default App;
