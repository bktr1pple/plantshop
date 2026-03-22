// app/landscape-design/page.tsx
'use client';

import React, { useState, useRef, useMemo } from 'react';
import { LazyMotion, m, domAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import { 
  Leaf, 
  Eye, 
  Box, 
  Wrench, 
  Shield,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  ChevronRight,
  Star,
  Calendar,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

// Types
interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Project {
  id: number;
  category: 'homesteads' | 'commercial' | 'parks';
  before: string;
  after: string;
  title: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Benefit {
  title: string;
  description: string;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  project: string;
}

interface FAQ {
  question: string;
  answer: string;
}

// Data - Memoized to prevent unnecessary recalculations
const usePageData = () => {
  return useMemo(() => ({
    services: [
      {
        icon: <Leaf className="w-6 h-6" />,
        title: "Design",
        description: "Site analysis, zoning, and detailed sketches for optimal space utilization"
      },
      {
        icon: <Eye className="w-6 h-6" />,
        title: "3D Visualization",
        description: "Photorealistic representation of your future garden before construction"
      },
      {
        icon: <Box className="w-6 h-6" />,
        title: "Selection of Materials",
        description: "Curated stone, plants, lighting, and decor elements for cohesive design"
      },
      {
        icon: <Wrench className="w-6 h-6" />,
        title: "Implementation",
        description: "Professional construction and landscaping work with quality control"
      },
      {
        icon: <Shield className="w-6 h-6" />,
        title: "Author's Supervision",
        description: "Comprehensive support from initial concept to project completion"
      }
    ] as Service[],

    projects: [
      {
        id: 1,
        category: 'homesteads' as const,
        before: '/images/projects/homestead-1-before.jpg',
        after: '/images/projects/homestead-1-after.jpg',
        title: 'Modern Family Garden'
      },
      {
        id: 2,
        category: 'commercial' as const,
        before: '/images/projects/commercial-1-before.jpg',
        after: '/images/projects/commercial-1-after.jpg',
        title: 'Corporate Park Redesign'
      },
      {
        id: 3,
        category: 'parks' as const,
        before: '/images/projects/park-1-before.jpg',
        after: '/images/projects/park-1-after.jpg',
        title: 'Community Park Renovation'
      },
      {
        id: 4,
        category: 'homesteads' as const,
        before: '/images/projects/homestead-2-before.jpg',
        after: '/images/projects/homestead-2-after.jpg',
        title: 'Luxury Villa Landscape'
      }
    ] as Project[],

    processSteps: [
      {
        step: 1,
        title: "Consultation and Site Visit",
        description: "Initial meeting to understand your vision and assess the property",
        icon: <Calendar className="w-6 h-6" />
      },
      {
        step: 2,
        title: "Territory Analysis",
        description: "Comprehensive analysis of relief, lighting, soil composition",
        icon: <Leaf className="w-6 h-6" />
      },
      {
        step: 3,
        title: "Sketch and Concept",
        description: "Creative design development and layout planning",
        icon: <Eye className="w-6 h-6" />
      },
      {
        step: 4,
        title: "3D Visualization",
        description: "Realistic rendering of the final design concept",
        icon: <Box className="w-6 h-6" />
      },
      {
        step: 5,
        title: "Project Implementation",
        description: "Professional execution with quality materials and workmanship",
        icon: <Wrench className="w-6 h-6" />
      },
      {
        step: 6,
        title: "Author Support",
        description: "Ongoing maintenance and support after project completion",
        icon: <Shield className="w-6 h-6" />
      }
    ] as ProcessStep[],

    benefits: [
      {
        title: "Individual Approach",
        description: "Every project is uniquely tailored to your specific needs and preferences"
      },
      {
        title: "Expert Team",
        description: "Experienced designers and agronomists with proven track record"
      },
      {
        title: "Planting Guarantee",
        description: "Full warranty on all planting work and materials"
      },
      {
        title: "Eco Solutions",
        description: "Sustainable and environmentally friendly design practices"
      },
      {
        title: "Turnkey Service",
        description: "Complete project management from concept to completion"
      }
    ] as Benefit[],

    reviews: [
      {
        id: 1,
        name: "Sarah Johnson",
        rating: 5,
        text: "My yard has become a real oasis! The team transformed our boring space into a beautiful retreat.",
        project: "Family Garden Makeover"
      },
      {
        id: 2,
        name: "Michael Chen",
        rating: 5,
        text: "Professional service from start to finish. The 3D visualization helped us visualize the result perfectly.",
        project: "Modern Courtyard"
      },
      {
        id: 3,
        name: "Emma Rodriguez",
        rating: 5,
        text: "The attention to detail and quality of work exceeded our expectations. Highly recommended!",
        project: "Luxury Villa Landscape"
      }
    ] as Review[],

    faqs: [
      {
        question: "How long does it take to create a project?",
        answer: "Typically 2-4 weeks depending on complexity, including site analysis, design development, and 3D visualization."
      },
      {
        question: "Do you only do design without implementation?",
        answer: "We offer both design-only services and full turnkey implementation. You can choose what fits your needs."
      },
      {
        question: "Can I order only 3D visualization?",
        answer: "Yes, we provide standalone 3D visualization services based on your existing plans or our design concepts."
      },
      {
        question: "What's included in the author's supervision?",
        answer: "Regular site visits, quality control, material selection approval, and coordination with construction teams."
      }
    ] as FAQ[]
  }), []);
};

// Optimized Components
const SectionWrapper = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <m.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
      className={`will-change-transform ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </m.section>
  );
};

const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900 shadow-lg hover:shadow-xl transition-all duration-300 will-change-transform"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
        {service.icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {service.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {service.description}
      </p>
    </m.div>
  );
};

const OptimizedImage = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={600}
        height={400}
        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMk9KSahlJuoX0haN6YZQE13N"
        loading="lazy"
      />
    </div>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <m.div
      whileHover={{ scale: 1.05 }}
      className="relative h-80 cursor-pointer will-change-transform"
      style={{ willChange: 'transform' }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
    >
      <m.div
        className="absolute inset-0 rounded-2xl shadow-lg will-change-transform"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* Front - Before */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <OptimizedImage 
            src={project.before} 
            alt={`${project.title} before`}
            className="h-full"
          />
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-8 h-8 mx-auto mb-2" />
              <span className="font-semibold">Before</span>
            </div>
          </div>
        </div>
        
        {/* Back - After */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <OptimizedImage 
            src={project.after} 
            alt={`${project.title} after`}
            className="h-full"
          />
          <div className="absolute inset-0 bg-emerald-900/60 rounded-2xl flex items-end p-6">
            <div className="text-white">
              <span className="bg-emerald-600 px-3 py-1 rounded-full text-sm font-medium">
                {project.category}
              </span>
              <h4 className="text-lg font-semibold mt-2">{project.title}</h4>
            </div>
          </div>
        </div>
      </m.div>
    </m.div>
  );
};

const ProcessTimeline = () => {
  const processSteps = usePageData().processSteps;

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-400 to-green-600 hidden lg:block" />
      
      <div className="space-y-12 lg:space-y-0">
        {processSteps.map((step, index) => (
          <m.div
            key={step.step}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`flex flex-col lg:flex-row items-center ${
              index % 2 === 0 ? 'lg:flex-row-reverse' : ''
            } will-change-transform`}
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Content */}
            <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pl-12' : 'lg:pr-12'} mb-8 lg:mb-0`}>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Icon */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-emerald-200 dark:border-emerald-800 shadow-lg">
                <div className="text-emerald-600 dark:text-emerald-400">
                  {step.icon}
                </div>
              </div>
            </div>
          </m.div>
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900 shadow-lg will-change-transform"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="flex items-center mb-4">
        <div className="flex mr-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < review.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 italic mb-4">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="font-semibold text-gray-800 dark:text-white">
          {review.name}
        </p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {review.project}
        </p>
      </div>
    </m.div>
  );
};

const FAQItem = ({ faq, index }: { faq: FAQ; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 will-change-transform"
      style={{ willChange: 'transform, opacity' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-6 text-left"
      >
        <span className="text-lg font-medium text-gray-800 dark:text-white pr-4">
          {faq.question}
        </span>
        <m.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 will-change-transform"
          style={{ willChange: 'transform' }}
        >
          <ChevronRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </m.div>
      </button>
      <m.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden will-change-transform"
        style={{ willChange: 'transform, opacity' }}
      >
        <p className="pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
          {faq.answer}
        </p>
      </m.div>
    </m.div>
  );
};

// Staggered Animation Container
const StaggerContainer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <m.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </m.div>
  );
};

const StaggerItem = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.5 }}
      className={`will-change-transform ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </m.div>
  );
};

// Main Page Component
export default function LandscapeDesignPage() {
  const {
    services,
    projects,
    reviews,
    faqs,
    benefits
  } = usePageData();

  const [activeFilter, setActiveFilter] = useState<'all' | 'homesteads' | 'commercial' | 'parks'>('all');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const filteredProjects = useMemo(() => 
    activeFilter === 'all' 
      ? projects 
      : projects.filter(project => project.category === activeFilter),
    [activeFilter, projects]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-green-600/10" />
          <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
            <m.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 will-change-transform"
              style={{ willChange: 'transform, opacity' }}
            >
              Transform Your
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {' '}Outdoor Space
              </span>
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto will-change-transform"
              style={{ willChange: 'transform, opacity' }}
            >
              We create more than just landscaping - we design an environment that reflects your lifestyle, 
              harmonizes with nature, and maximizes functionality.
            </m.p>
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center will-change-transform"
              style={{ willChange: 'transform, opacity' }}
            >
              <button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Your Project
              </button>
              <button className="border-2 border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-400 dark:hover:text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                View Portfolio
              </button>
            </m.div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 to-transparent" />
        </section>

        {/* Services Section */}
        <SectionWrapper className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 will-change-transform"
              style={{ willChange: 'transform, opacity' }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our Approach to Creating Landscape Design
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Comprehensive services that transform your vision into a living, breathing reality
              </p>
            </m.div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <StaggerItem key={index}>
                  <ServiceCard service={service} index={index} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </SectionWrapper>

        {/* Portfolio Section */}
        <SectionWrapper className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our Portfolio
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                See the transformation from concept to completion
              </p>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {(['all', 'homesteads', 'commercial', 'parks'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      activeFilter === filter
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg'
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProjects.map((project) => (
                <StaggerItem key={project.id}>
                  <ProjectCard project={project} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            <div className="text-center mt-12">
              <button className="group bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center mx-auto">
                View All Projects
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </SectionWrapper>

        {/* Process Section */}
        <SectionWrapper className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our Work Process
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                A structured approach ensuring excellence at every stage
              </p>
            </div>

            <ProcessTimeline />
          </div>
        </SectionWrapper>

        {/* Benefits Section */}
        <SectionWrapper className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Benefits of Cooperation
              </h2>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <StaggerItem key={index}>
                  <m.div
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-emerald-100 dark:border-emerald-900 shadow-lg will-change-transform"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center text-white mb-6">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {benefit.description}
                    </p>
                  </m.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </SectionWrapper>

        {/* Reviews Section */}
        <SectionWrapper className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Customer Reviews
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Hear what our clients say about their transformed spaces
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, index) => (
                <StaggerItem key={review.id}>
                  <ReviewCard review={review} index={index} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </SectionWrapper>

        {/* CTA Section */}
        <SectionWrapper className="py-20 px-4 bg-gradient-to-br from-emerald-600 to-green-700">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Contact Form */}
              <m.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 will-change-transform"
                style={{ willChange: 'transform, opacity' }}
              >
                <h3 className="text-3xl font-bold text-white mb-2">
                  Want to update your yard or garden?
                </h3>
                <p className="text-emerald-100 mb-8">
                  Order a consultation with our designer — we will help create the space of your dreams.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-100 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-100 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your project..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-100 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-emerald-600 hover:bg-emerald-50 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Send Request
                  </button>
                </form>
              </m.div>

              {/* Contact Info */}
              <m.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white will-change-transform"
                style={{ willChange: 'transform, opacity' }}
              >
                <h3 className="text-3xl font-bold mb-8">Get in Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-emerald-100">Phone</p>
                      <p className="text-xl font-semibold">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-emerald-100">Email</p>
                      <p className="text-xl font-semibold">hello@landscapedesign.com</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-emerald-100">Telegram</p>
                      <p className="text-xl font-semibold">@landscape_design</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-emerald-100">Instagram</p>
                      <p className="text-xl font-semibold">@landscape_design_studio</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <h4 className="font-semibold text-lg mb-4">Visit Our Studio</h4>
                  <p className="text-emerald-100">
                    123 Garden Street<br />
                    Green Valley, CA 94201<br />
                    Mon-Fri: 9AM-6PM
                  </p>
                </div>
              </m.div>
            </div>
          </div>
        </SectionWrapper>

        {/* FAQ Section */}
        <SectionWrapper className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Everything you need to know about our landscape design services
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100 dark:border-emerald-900 shadow-lg">
              {faqs.map((faq, index) => (
                <FAQItem key={index} faq={faq} index={index} />
              ))}
            </div>
          </div>
        </SectionWrapper>
      </div>
    </LazyMotion>
  );
}
