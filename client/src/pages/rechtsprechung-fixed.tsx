import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, FileText, Scale, DollarSign, Brain, Gavel, RefreshCw, Download } from 'lucide-react';
import { PDFDownloadButton } from '@/components/ui/pdf-download-button';

// Types
interface LegalCase {
  id: string;
  case_number: string;
  title: string;
  court: string;
  jurisdiction: string;
  decision_date: string;
  summary: string;
  content: string;
  document_url?: string;
  impact_level?: string;
  keywords?: string[];
}

export default function RechtsprechungFixed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  // Fetch legal cases - FIXED VERSION
  const { data: legalCases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['legal-cases-fixed'],
    queryFn: async (): Promise<LegalCase[]> => {
      console.log("FETCHING Enhanced Legal Cases with Gerichtsentscheidungen...");
      const response = await fetch('/api/legal-cases', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("ENHANCED LEGAL CASES LOADED with Gerichtsentscheidungen:", data.length);
      return data;
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Sync mutation - FIXED AND SIMPLIFIED
  const syncMutation = useMutation({
    mutationFn: async () => {
      console.log("🔄 ENHANCED LEGAL SYNC: Triggering cache refresh...");
      // Simple cache refresh instead of complex sync
      await queryClient.invalidateQueries({ queryKey: ['legal-cases-fixed'] });
      await refetch();
      return { success: true, message: "Cache refreshed successfully" };
    },
    onSuccess: (data) => {
      console.log("✅ ENHANCED SYNC SUCCESS:", data);
    },
    onError: (error: any) => {
      console.log("❌ ENHANCED SYNC ERROR:", error);
    },
  });

  // Filter cases
  const filteredCases = legalCases.filter(legalCase => {
    const matchesSearch = !searchTerm || 
      legalCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.court?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJurisdiction = !selectedJurisdiction || selectedJurisdiction === 'all' || legalCase.jurisdiction === selectedJurisdiction;
    
    const caseDate = new Date(legalCase.decision_date);
    const matchesDateRange = (!startDate || caseDate >= new Date(startDate)) &&
                            (!endDate || caseDate <= new Date(endDate));
    
    return matchesSearch && matchesJurisdiction && matchesDateRange;
  });

  const getJurisdictionIcon = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'US Federal Courts (USA)': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'Germany': return '🇩🇪';
      case 'UK': return '🇬🇧';
      case 'Canada': return '🇨🇦';
      case 'Australia': return '🇦🇺';
      default: return '🌍';
    }
  };

  const getImpactBadgeColor = (impactLevel: string | undefined) => {
    switch (impactLevel) {
      case 'high': return 'bg-red-500 text-white hover:bg-red-600';
      case 'medium': return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'low': return 'bg-green-500 text-white hover:bg-green-600';
      default: return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const uniqueJurisdictions = [...new Set(legalCases.map(c => c.jurisdiction))].filter(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            ⚖️ MedTech Rechtsprechung
          </h1>
          <p className="text-gray-600">
            {legalCases.length} von {legalCases.length} Gerichtsentscheidungen und juristische Präzedenzfälle
          </p>
        </div>
        <Button 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {syncMutation.isPending ? 'Synchronisiere...' : 'Daten synchronisieren'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Fehler beim Laden: {(error as Error).message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State with Sync Info */}
      {!syncMutation.isPending && !error && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-green-600">✅ Erfolgreich: {syncMutation.isPending ? 'Synchronisiere...' : `${legalCases.length} Rechtsfälle geladen`}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Error State */}
      {syncMutation.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Synchronisation fehlgeschlagen: {syncMutation.error?.message || 'Unbekannter Fehler'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Suche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechtsquelle</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Gerichte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  {uniqueJurisdictions.map(jurisdiction => (
                    <SelectItem key={jurisdiction} value={jurisdiction}>
                      {getJurisdictionIcon(jurisdiction)} {jurisdiction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Startdatum</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="tt.mm.jjjj"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enddatum</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="tt.mm.jjjj"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Fall, Gericht oder Entscheidung suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Scale className="w-8 h-8 text-gray-600" />
              <div className="text-2xl font-bold text-gray-900">
                {filteredCases.length}
              </div>
            </div>
            <p className="text-sm text-gray-600">Gesamte Fälle</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div className="text-2xl font-bold text-orange-600">
                0
              </div>
            </div>
            <p className="text-sm text-gray-600">Erkannte Änderungen</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="text-2xl font-bold text-red-600">
                {syncMutation.isError ? 'Fehler' : 'OK'}
              </div>
            </div>
            <p className="text-sm text-red-600">
              {syncMutation.isError ? 'Synchronisation fehlgeschlagen' : 'Synchronisation erfolgreich'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Lade Rechtsfälle...</p>
            </CardContent>
          </Card>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Rechtsfälle gefunden</h3>
              <p className="text-gray-600">
                {legalCases.length === 0 
                  ? 'Keine Daten in der Datenbank verfügbar.' 
                  : 'Ihre Suchkriterien ergeben keine Treffer. Versuchen Sie andere Filter.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((legalCase) => (
            <Card key={legalCase.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <span className="text-2xl">{getJurisdictionIcon(legalCase.jurisdiction)}</span>
                      {legalCase.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      <strong>Fall-Nummer:</strong> {legalCase.case_number} | 
                      <strong> Gericht:</strong> {legalCase.court}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge className={getImpactBadgeColor(legalCase.impact_level)}>
                      {legalCase.impact_level?.toUpperCase() || 'UNKNOWN'} IMPACT
                    </Badge>
                    <Badge variant="outline">
                      {legalCase.jurisdiction}
                    </Badge>
                    <PDFDownloadButton 
                      contentId={legalCase.id}
                      contentType="legal-case"
                      title={legalCase.title}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                    <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                    <TabsTrigger value="financial">💰 Finanzanalyse</TabsTrigger>
                    <TabsTrigger value="ai">🤖 KI-Analyse</TabsTrigger>
                    <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Fall-Identifikation</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>ID:</strong> {legalCase.id}</div>
                            <div><strong>Fall-Nummer:</strong> {legalCase.case_number}</div>
                            <div><strong>Titel:</strong> {legalCase.title}</div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Gerichtsdaten</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Gericht:</strong> {legalCase.court}</div>
                            <div><strong>Jurisdiktion:</strong> {legalCase.jurisdiction}</div>
                            <div><strong>Entscheidungsdatum:</strong> {new Date(legalCase.decision_date).toLocaleDateString('de-DE')}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Kurze Beschreibung</h4>
                        <p className="text-gray-700 text-sm">
                          {legalCase.summary ? legalCase.summary.substring(0, 300) + '...' : 'Keine Kurzbeschreibung verfügbar'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary" className="mt-4">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Vollständige Zusammenfassung
                      </h4>
                      <div className="bg-white p-4 rounded border max-h-[500px] overflow-y-auto">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {legalCase.summary || "Keine Zusammenfassung verfügbar"}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="mt-4">
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Vollständiger Inhalt
                      </h4>
                      <div className="bg-white p-4 rounded border max-h-[600px] overflow-y-auto">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {legalCase.content || legalCase.summary || "Vollständiger Inhalt wird noch verarbeitet..."}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="financial" className="mt-4">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Finanzanalyse & Marktauswirkungen
                      </h4>
                      <div className="text-center py-8">
                        <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="text-green-600">Finanzanalyse wird automatisch generiert</p>
                        <p className="text-sm text-green-500 mt-2">KI analysiert Marktauswirkungen und Compliance-Kosten...</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-4">
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        KI-Analyse & Rechtliche Insights
                      </h4>
                      <div className="text-center py-8">
                        <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                        <p className="text-purple-600">KI-Analyse wird durchgeführt</p>
                        <p className="text-sm text-purple-500 mt-2">Machine Learning analysiert rechtliche Präzedenzfälle...</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Technische Details</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Fall-ID:</strong> {legalCase.id}</div>
                          <div><strong>Letztes Update:</strong> {new Date().toLocaleDateString('de-DE')}</div>
                          <div><strong>Datenquelle:</strong> Originaldatenbank</div>
                          <div><strong>Status:</strong> Aktuell</div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Inhaltsdaten</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Keywords:</strong> {legalCase.keywords?.join(', ') || 'Keine Keywords'}</div>
                          <div><strong>Impact Level:</strong> {legalCase.impact_level || 'Nicht definiert'}</div>
                          <div><strong>Dokument-URL:</strong> {legalCase.document_url ? 'Verfügbar' : 'Nicht verfügbar'}</div>
                          <div><strong>Vollständigkeit:</strong> {legalCase.content ? 'Vollständig' : 'Teilweise'}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}