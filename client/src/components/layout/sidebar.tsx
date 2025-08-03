import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  BarChart3, 
  Database, 
  Globe,
  FileText, 
  Newspaper, 
  CheckCircle, 
  TrendingUp,
  Brain,
  Book,
  Users,
  Settings,
  Archive,
  Shield,
  Search,
  RefreshCw,
  Scale,
  FileSearch,
  ChevronDown,
  ChevronRight,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoPath from "@assets/ICON Helix_1753735921077.jpg";

// Verbesserte thematische Sidebar-Struktur basierend auf Benutzeranalyse
interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

const navigationStructure: Record<string, NavigationSection> = {
  // 1. Dashboard & Übersicht
  dashboard: {
    title: "Übersicht",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3 },
    ],
    defaultOpen: true
  },

  // 2. Daten & Integrationen 
  dataIntegrations: {
    title: "Daten & Integrationen",
    items: [
      { name: "Datenerfassung", href: "/data-collection", icon: Database },
      { name: "Sync-Verwaltung", href: "/sync-manager", icon: RefreshCw },
      { name: "Globale Quellen", href: "/global-sources", icon: Globe },
      { name: "GRIP Integration", href: "/grip-data", icon: Shield },
    ],
    defaultOpen: true
  },

  // 3. Regulatorik & Compliance
  regulatory: {
    title: "Regulatorik & Compliance",
    items: [
      { name: "Regulatory Updates", href: "/regulatory-updates", icon: FileText },
      { name: "Genehmigungsprozess", href: "/approval-workflow", icon: CheckCircle },
    ],
    defaultOpen: true
  },

  // 4. Rechtsfälle & Analysen
  legal: {
    title: "Rechtsfälle & Analysen",
    items: [
      { name: "Legal Cases", href: "/legal-cases", icon: Scale },
      { name: "Erweiterte Analysen", href: "/enhanced-legal-cases", icon: TrendingUp },
    ],
    defaultOpen: false
  },

  // 5. Wissen & KI-Insights
  knowledge: {
    title: "Wissen & KI-Insights",
    items: [
      { name: "Intelligente Suche", href: "/intelligent-search", icon: Search },
      { name: "AI Insights", href: "/ai-insights", icon: Brain },
      { name: "Wissensdatenbank", href: "/knowledge-base", icon: Book },
      { name: "Historische Daten", href: "/historical-data", icon: Archive },
    ],
    defaultOpen: false
  },

  // 6. Kommunikation & Berichte
  communication: {
    title: "Kommunikation & Berichte",
    items: [
      { name: "Newsletter-Verwaltung", href: "/newsletter-manager", icon: Newspaper },
      { name: "Analytics & Reporting", href: "/analytics", icon: TrendingUp },
    ],
    defaultOpen: false
  },

  // 7. Administration & Einstellungen
  administration: {
    title: "Administration & Einstellungen",
    items: [
      { name: "System-Verwaltung", href: "/administration", icon: Settings },
      { name: "Benutzerverwaltung", href: "/user-management", icon: Users },
      { name: "Datenquellen-Admin", href: "/administration/data-sources", icon: Database },
      { name: "Newsletter-Verwaltung", href: "/newsletter-admin", icon: Mail },
      { name: "Audit-Protokolle", href: "/audit-logs", icon: FileSearch },
    ],
    defaultOpen: false
  }
};

export function Sidebar() {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Initialize with default open states
    const initial: Record<string, boolean> = {};
    Object.entries(navigationStructure).forEach(([key, section]) => {
      initial[key] = section.defaultOpen || false;
    });
    return initial;
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = location === item.href;
    const IconComponent = item.icon;
    
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer",
          isActive
            ? "bg-[#07233e] text-white shadow-md"
            : "text-gray-700 hover:bg-[#f0f8ff] hover:text-[#07233e]"
        )}
      >
        <IconComponent className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  const renderNavigationSection = (sectionKey: string, section: NavigationSection) => {
    const isExpanded = expandedSections[sectionKey];
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
    
    return (
      <div key={sectionKey} className="mb-3">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#07233e] transition-colors duration-200"
        >
          <span>{section.title}</span>
          <ChevronIcon className="h-4 w-4" />
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {section.items.map(renderNavigationItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 deltaways-nav shadow-lg z-50 overflow-y-auto">
      {/* DELTA WAYS Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer space-y-2">
            <img 
              src={logoPath} 
              alt="Helix Logo" 
              className="h-32 w-32 object-cover rounded-lg ring-2 ring-[#b0d4f6]"
            />
            <span className="text-lg deltaways-brand-text text-[#07233e]">HELIX</span>
            <p className="text-xs font-medium text-gray-600">Powered by DELTA WAYS</p>
          </div>
        </Link>
      </div>
      
      {/* Optimierter Suchbereich */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/intelligent-search">
          <div className="flex items-center px-3 py-2 bg-[#f0f8ff] rounded-lg border border-[#b0d4f6] hover:bg-[#e6f3ff] transition-colors duration-200 cursor-pointer">
            <Search className="h-4 w-4 text-[#07233e] mr-2" />
            <span className="text-sm text-[#07233e] font-medium">Intelligente Suche</span>
          </div>
        </Link>
      </div>
      
      {/* Thematisch organisierte Navigation */}
      <nav className="mt-4 pb-8 flex-1 overflow-y-auto">
        <div className="px-2 space-y-2">
          {Object.entries(navigationStructure).map(([sectionKey, section]) =>
            renderNavigationSection(sectionKey, section)
          )}
        </div>
      </nav>
      
      {/* Status-Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <span className="text-green-600 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>46 Datenquellen</span>
            <span className="text-blue-600 font-medium">Aktiv</span>
          </div>
        </div>
      </div>
    </aside>
  );
}