'use client';

import { useRouter } from "next/navigation";
import { useNotification } from '@/app/components/NotificationSystem';
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, LazyMotion, useScroll, useTransform, domAnimation } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Droplets, 
  Scissors,
  Heart, 
  ShoppingCart, 
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  Sprout,
  Leaf,
  ChevronRight,
  Edit3,
  Plus,
  Star,
  Award,
  TrendingUp,
  Cloud,
  Bell,
  MessageCircle,
  Zap,
  Target
} from 'lucide-react';

// Types
interface Plant {
  id: string;
  name: string;
  image: string;
  status: 'awaiting' | 'delivered' | 'care';
  careLevel: 'easy' | 'medium' | 'hard';
  lastWatered: string;
  health: number;
}

interface Order {
  id: string;
  plantName: string;
  image: string;
  orderDate: string;
  status: 'preparing' | 'shipped' | 'delivered';
  price: number;
}

interface CareTip {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  frequency: string;
}

interface Project {
  id: string;
  name: string;
  stage: 'sketch' | 'visualization' | 'implementation' | 'completed';
  image: string;
  progress: number;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  progress?: number;
}

interface Challenge {
  id: string;
  task: string;
  reward: number;
  completed: boolean;
}

// Mock data
const mockPlants: Plant[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    image: '/api/placeholder/300/300',
    status: 'delivered',
    careLevel: 'easy',
    lastWatered: '2024-01-15',
    health: 95
  },
  {
    id: '2',
    name: 'Fiddle Leaf Fig',
    image: '/api/placeholder/300/300',
    status: 'care',
    careLevel: 'medium',
    lastWatered: '2024-01-14',
    health: 75
  },
  {
    id: '3',
    name: 'Snake Plant',
    image: '/api/placeholder/300/300',
    status: 'awaiting',
    careLevel: 'easy',
    lastWatered: '2024-01-13',
    health: 100
  },
  {
    id: '4',
    name: 'Peace Lily',
    image: '/api/placeholder/300/300',
    status: 'delivered',
    careLevel: 'easy',
    lastWatered: '2024-01-16',
    health: 88
  }
];

const mockOrders: Order[] = [
  {
    id: '1',
    plantName: 'Monstera Deliciosa',
    image: '/api/placeholder/80/80',
    orderDate: '2024-01-10',
    status: 'delivered',
    price: 45.99
  },
  {
    id: '2',
    plantName: 'Fiddle Leaf Fig',
    image: '/api/placeholder/80/80',
    orderDate: '2024-01-08',
    status: 'shipped',
    price: 62.50
  },
  {
    id: '3',
    plantName: 'ZZ Plant',
    image: '/api/placeholder/80/80',
    orderDate: '2024-01-05',
    status: 'preparing',
    price: 35.00
  }
];

const mockCareTips: CareTip[] = [
  {
    id: '1',
    icon: <Droplets className="w-5 h-5" />,
    title: 'Watering Schedule',
    description: 'Water 2 times a week, keep soil moist but not soggy',
    frequency: 'Weekly'
  },
  {
    id: '2',
    icon: <Sun className="w-5 h-5" />,
    title: 'Light Requirements',
    description: 'Bright indirect light, avoid direct sunlight',
    frequency: 'Daily'
  },
  {
    id: '3',
    icon: <Scissors className="w-5 h-5" />,
    title: 'Pruning',
    description: 'Trim yellow leaves once a month to promote growth',
    frequency: 'Monthly'
  },
  {
    id: '4',
    icon: <Cloud className="w-5 h-5" />,
    title: 'Humidity',
    description: 'Mist leaves weekly for tropical plants',
    frequency: 'Weekly'
  }
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Balcony Garden',
    stage: 'implementation',
    image: '/api/placeholder/250/150',
    progress: 75
  },
  {
    id: '2',
    name: 'Office Green Wall',
    stage: 'visualization',
    image: '/api/placeholder/250/150',
    progress: 40
  },
  {
    id: '3',
    name: 'Kitchen Herb Garden',
    stage: 'completed',
    image: '/api/placeholder/250/150',
    progress: 100
  }
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Plant',
    icon: '🌱',
    earned: true
  },
  {
    id: '2',
    name: 'Green Thumb',
    icon: '👑',
    earned: false,
    progress: 80
  },
  {
    id: '3',
    name: 'Plant Collector',
    icon: '🏆',
    earned: false,
    progress: 45
  },
  {
    id: '4',
    name: 'Watering Pro',
    icon: '💧',
    earned: true
  }
];

const mockChallenges: Challenge[] = [
  {
    id: '1',
    task: 'Water plants 3 times this week',
    reward: 50,
    completed: false
  },
  {
    id: '2',
    task: 'Share plant progress with friends',
    reward: 25,
    completed: true
  },
  {
    id: '3',
    task: 'Add 2 new plants to collection',
    reward: 75,
    completed: false
  }
];

// Animation components
const TextReveal = ({ children, delay = 0 }: { children: string; delay?: number }) => (
  <motion.span
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="inline-block"
  >
    {children}
  </motion.span>
);

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'emerald',
  delay = 0 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  color?: 'emerald' | 'green' | 'gray' | 'blue';
  delay?: number;
}) => {
  const colorClasses = {
    emerald: 'from-emerald-500 to-green-500',
    green: 'from-green-600 to-emerald-600',
    gray: 'from-gray-600 to-gray-700',
    blue: 'from-blue-500 to-cyan-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white backdrop-blur-sm border border-white/10 shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <motion.p 
            className="text-2xl font-bold mt-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
        </div>
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="p-2 bg-white/20 rounded-full"
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

const PrimaryButton = ({ children, onClick, icon }: { children: string; onClick?: () => void; icon?: React.ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -1 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
  >
    {icon}
    {children}
  </motion.button>
);

const SecondaryButton = ({ children, onClick, icon }: { children: string; onClick?: () => void; icon?: React.ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center gap-2 px-6 py-3 border border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium transition-all duration-300"
  >
    {icon}
    {children}
  </motion.button>
);

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className={`bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/5 ${className}`}
  >
    {children}
  </motion.div>
);

const HealthRing = ({ progress, size = 60 }: { progress: number; size?: number }) => {
  const circumference = 2 * Math.PI * (size / 2 - 5);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-emerald-500 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
        {progress}%
      </div>
    </div>
  );
};

const PlantCard = ({ plant, delay = 0 }: { plant: Plant; delay?: number }) => {
  const statusConfig = {
    awaiting: { color: 'bg-yellow-500', text: 'Awaiting Delivery' },
    delivered: { color: 'bg-emerald-500', text: 'Delivered' },
    care: { color: 'bg-blue-500', text: 'Needs Care' }
  };

  const careLevelConfig = {
    easy: { color: 'text-emerald-500', text: 'Easy' },
    medium: { color: 'text-yellow-500', text: 'Medium' },
    hard: { color: 'text-red-500', text: 'Hard' }
  };

  return (
    <GlassCard className="p-4">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl mb-4 flex items-center justify-center">
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Leaf className="w-16 h-16 text-emerald-500" />
          </motion.div>
        </div>
        <div className={`absolute top-3 right-3 ${statusConfig[plant.status].color} text-white px-3 py-1 rounded-full text-xs font-medium`}>
          {statusConfig[plant.status].text}
        </div>
        <div className="absolute top-3 left-3">
          <HealthRing progress={plant.health} size={40} />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{plant.name}</h3>
          <span className={`text-sm font-medium ${careLevelConfig[plant.careLevel].color}`}>
            {careLevelConfig[plant.careLevel].text}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Last watered: {plant.lastWatered}
        </p>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Add to Care
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            View Tips
          </motion.button>
        </div>
      </div>
    </GlassCard>
  );
};

const OrderCard = ({ order, delay = 0 }: { order: Order; delay?: number }) => {
  const statusConfig = {
    preparing: { color: 'bg-yellow-500', icon: Clock, text: 'Preparing' },
    shipped: { color: 'bg-blue-500', icon: Truck, text: 'En Route' },
    delivered: { color: 'bg-emerald-500', icon: CheckCircle, text: 'Delivered' }
  };

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ x: 5, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl flex items-center justify-center">
        <Leaf className="w-8 h-8 text-emerald-500" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">{order.plantName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ordered: {order.orderDate}</p>
        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${order.price.toFixed(2)}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 ${statusConfig[order.status].color} text-white px-3 py-1 rounded-full text-sm`}>
          <StatusIcon className="w-4 h-4" />
          <span>{statusConfig[order.status].text}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const CareTipCard = ({ tip, delay = 0 }: { tip: CareTip; delay?: number }) => (
  <GlassCard className="p-6">
    <div className="flex items-center gap-3 mb-4">
      <motion.div 
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400"
      >
        {tip.icon}
      </motion.div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{tip.title}</h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{tip.frequency}</p>
      </div>
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{tip.description}</p>
  </GlassCard>
);

const ProjectCard = ({ project, delay = 0 }: { project: Project; delay?: number }) => {
  const stageConfig = {
    sketch: { color: 'bg-purple-500', text: 'Sketch' },
    visualization: { color: 'bg-blue-500', text: 'Visualization' },
    implementation: { color: 'bg-yellow-500', text: 'Implementation' },
    completed: { color: 'bg-emerald-500', text: 'Completed' }
  };

  return (
    <GlassCard className="p-4">
      <div className="w-full h-32 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl mb-4 flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.3 }}
        >
          <Sprout className="w-12 h-12 text-emerald-500" />
        </motion.div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
          <span className={`${stageConfig[project.stage].color} text-white px-2 py-1 rounded-full text-xs font-medium`}>
            {stageConfig[project.stage].text}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
            />
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          View Details
        </motion.button>
      </div>
    </GlassCard>
  );
};

const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -2 }}
    className={`flex items-center gap-3 p-4 rounded-2xl ${
      achievement.earned 
        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
    }`}
  >
    <span className="text-2xl">{achievement.icon}</span>
    <div className="flex-1">
      <h4 className="font-semibold text-sm">{achievement.name}</h4>
      {!achievement.earned && achievement.progress && (
        <div className="w-full bg-white/30 rounded-full h-1 mt-1">
          <div 
            className="bg-white h-1 rounded-full" 
            style={{ width: `${achievement.progress}%` }}
          />
        </div>
      )}
    </div>
    {achievement.earned && <CheckCircle className="w-4 h-4" />}
  </motion.div>
);

const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${challenge.completed ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      <span className="text-sm text-gray-700 dark:text-gray-300">{challenge.task}</span>
    </div>
    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
      <Star className="w-4 h-4" />
      <span className="font-medium">{challenge.reward}</span>
    </div>
  </motion.div>
);

const ParticleOverlay = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const FloatingAssistant = () => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg flex items-center justify-center z-50"
  >
    <MessageCircle className="w-6 h-6 text-white" />
  </motion.button>
);

const MorphingBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <motion.div
      animate={{
        borderRadius: ["30%", "50%", "30%"],
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-300/20 to-green-400/20"
    />
    <motion.div
      animate={{
        borderRadius: ["50%", "30%", "50%"],
        rotate: [180, 360, 180],
        scale: [1.2, 1, 1.2]
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-green-300/20 to-emerald-400/20"
    />
  </div>
);

// Custom hook for safe area insets
const useSafeArea = () => {
  return {
    top: 'env(safe-area-inset-top, 0px)',
    right: 'env(safe-area-inset-right, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)',
    left: 'env(safe-area-inset-left, 0px)',
  };
};

export default function GardenerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDark, setIsDark] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const safeArea = useSafeArea();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // User stats
  const userStats = useMemo(() => [
    { title: 'Total Plants', value: '12', icon: <Leaf className="w-6 h-6" />, color: 'emerald' as const },
    { title: 'Active Orders', value: '3', icon: <ShoppingCart className="w-6 h-6" />, color: 'green' as const },
    { title: 'Care Streak', value: '45 days', icon: <Award className="w-6 h-6" />, color: 'emerald' as const },
    { title: 'Points', value: '1,240', icon: <Star className="w-6 h-6" />, color: 'blue' as const }
  ], []);

  const { addNotification } = useNotification();

  const handleEditProfile = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Test Title',
      message: 'Edit profile clicked',
      duration: 4000,
      action: {
        label: 'Test Schedule',
        onClick: () => alert('test'),
      },
    });

    console.log('Edit profile clicked');
  }, [addNotification]);

  const router = useRouter();

  const handleSettings = useCallback(() => {
    router.push("/dashboard/settings");
  }, [router]);

  const handleLogout = useCallback(() => {
    console.log('Logout clicked');
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <div 
        ref={containerRef}
        className={`min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 ${
          isDark ? 'dark' : ''
        }`}
        style={{
          paddingLeft: safeArea.left,
          paddingRight: safeArea.right,
          paddingTop: safeArea.top,
        }}
      >
        <ParticleOverlay />
        <MorphingBackground />
        <FloatingAssistant />
        
        {/* Header Section */}
        <motion.header 
          style={{ opacity, scale }}
          className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4"
                >
                  <TextReveal delay={0.1}>Welcome Back, </TextReveal>
                  <br />
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent"
                  >
                    Alexander!
                  </motion.span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-xl text-gray-600 dark:text-gray-300"
                >
                  🌿 Your plants are thriving and looking beautiful today!
                </motion.p>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDark(!isDark)}
                  className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 transition-colors"
                >
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </motion.button>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    A
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"
                  />
                </motion.div>
              </div>
            </div>

            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
            >
              {userStats.map((stat, index) => (
                <StatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  delay={0.8 + index * 0.1}
                />
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-wrap gap-4"
            >
              <PrimaryButton icon={<Edit3 className="w-4 h-4" />} onClick={handleEditProfile}>
                Edit Profile
              </PrimaryButton>
              <SecondaryButton icon={<Settings className="w-4 h-4" />} onClick={handleSettings}>
                Settings
              </SecondaryButton>
              <SecondaryButton icon={<LogOut className="w-4 h-4" />} onClick={handleLogout}>
                Logout
              </SecondaryButton>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 pb-20" style={{ paddingBottom: safeArea.bottom }}>
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Gamification Section */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Your Garden Journey 🏆
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Achievements */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    Achievements
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {mockAchievements.map((achievement) => (
                      <AchievementBadge key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </GlassCard>

                {/* Weekly Challenges */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    Weekly Challenges
                  </h3>
                  <div className="space-y-3">
                    {mockChallenges.map((challenge) => (
                      <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                  </div>
                </GlassCard>
              </div>
            </motion.section>

            {/* My Plants Section */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  My Plants 🌱
                </h2>
                <PrimaryButton icon={<Plus className="w-4 h-4" />}>
                  Add Plant
                </PrimaryButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockPlants.map((plant, index) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </motion.section>

            {/* Care Tips Section */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Care Tips 🌞💧✂️
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockCareTips.map((tip, index) => (
                  <CareTipCard
                    key={tip.id}
                    tip={tip}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </motion.section>

            {/* Orders Section */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              
              <div className="space-y-4">
                {mockOrders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </motion.section>

            {/* Projects Section */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Landscape Projects
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </motion.section>

            {/* Additional Features */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Progress Section */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                  Plant Care Progress
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Watering Schedule</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">80%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '80%' }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Fertilizing</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '60%' }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Pruning</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">40%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '40%' }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Weather & Calendar */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                  Today's Forecast
                </h3>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl"
                    >
                      <Cloud className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">22°C</p>
                      <p className="text-gray-600 dark:text-gray-300">Partly Cloudy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Perfect for plants</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Ideal</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-300">Next watering</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Tomorrow</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-300">Fertilizer due</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">In 3 days</span>
                  </div>
                </div>
              </GlassCard>
            </motion.section>
          </div>
        </main>
      </div>
    </LazyMotion>
  );
}