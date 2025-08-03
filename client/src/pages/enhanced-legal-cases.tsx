import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Scale, DollarSign, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, Brain } from 'lucide-react';

interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate: string;
  summary: string;
  content: string;
  documentUrl?: string;
  impactLevel: string;
  keywords: string[];
}

export default function EnhancedLegalCases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedImpactLevel, setSelectedImpactLevel] = useState('all');
  const queryClient = useQueryClient();

  // Fetch authentic legal cases from database
  const { data: legalCases = [], isLoading: isLoadingCases } = useQuery<LegalCase[]>({
    queryKey: ['/api/legal-cases'],
    queryFn: async (): Promise<LegalCase[]> => {
      const response = await fetch('/api/legal-cases');
      if (!response.ok) throw new Error('Failed to fetch legal cases');
      const data = await response.json();
      
      console.log("Legal Cases - Raw data:", data.length, "cases loaded");
      return data;
    }
  });

  // Refresh legal cases from database
  const refreshCasesMutation = useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-cases'] });
      return { success: true, message: "Legal cases refreshed from database" };
    },
    onSuccess: () => {
      console.log("Legal cases successfully refreshed");
    },
  });

  // Filter cases based on search and filters
  const filteredCases = legalCases.filter((legalCase: LegalCase) => {
    const matchesSearch = !searchTerm || 
      legalCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJurisdiction = selectedJurisdiction === 'all' || legalCase.jurisdiction?.includes(selectedJurisdiction);
    const matchesImpactLevel = selectedImpactLevel === 'all' || legalCase.impactLevel === selectedImpactLevel;
    
    return matchesSearch && matchesJurisdiction && matchesImpactLevel;
  });

  console.log("Enhanced Legal Cases DEBUG:", {
    totalCases: legalCases.length,
    filteredCases: filteredCases.length,
    searchTerm,
    selectedJurisdiction,
    selectedImpactLevel,
    sampleCase: legalCases[0]
  });

  const getJurisdictionIcon = (jurisdiction: string) => {
    if (jurisdiction?.includes('US')) return '🇺🇸';
    if (jurisdiction?.includes('EU')) return '🇪🇺';
    if (jurisdiction?.includes('DE')) return '🇩🇪';
    if (jurisdiction?.includes('UK')) return '🇬🇧';
    if (jurisdiction?.includes('CH')) return '🇨🇭';
    return '⚖️';
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rechtsprechung - Vollständige Originaldaten</h1>
          <p className="text-gray-600 mt-1">
            {legalCases.length} Rechtsfälle mit authentischen Originaldaten 
            <span className="text-green-600 font-medium ml-1">(Echte Datenbank)</span>
          </p>
        </div>
        <Button 
          onClick={() => refreshCasesMutation.mutate()}
          disabled={refreshCasesMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {refreshCasesMutation.isPending ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Aktualisiere...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Datenbank aktualisieren
            </>
          )}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Suche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechtsfälle durchsuchen</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Titel, Inhalt oder Schlüsselwörter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Jurisdiktion</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Jurisdiktionen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen ({legalCases.length})</SelectItem>
                  <SelectItem value="US Federal">🇺🇸 US Federal</SelectItem>
                  <SelectItem value="EU">🇪🇺 European Union</SelectItem>
                  <SelectItem value="DE">🇩🇪 Deutschland</SelectItem>
                  <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="CH">🇨🇭 Schweiz</SelectItem>
                  <SelectItem value="International">🌍 International</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Impact Level</label>
              <Select value={selectedImpactLevel} onValueChange={setSelectedImpactLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Impact Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Display */}
      <div className="grid gap-6">
        {isLoadingCases ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Lade Rechtsfälle aus Datenbank...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Rechtsfälle gefunden</h3>
              <p className="text-gray-600 mb-4">
                {legalCases.length === 0 
                  ? `Lade echte Rechtsfälle aus der Datenbank...` 
                  : `${legalCases.length} Fälle verfügbar, aber Filter ergeben 0 Treffer. Prüfe Suchkriterien.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((legalCase: LegalCase) => (
            <Card key={legalCase.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <span className="text-2xl">{getJurisdictionIcon(legalCase.jurisdiction)}</span>
                      {legalCase.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      <strong>Fall-Nummer:</strong> {legalCase.caseNumber} | 
                      <strong> Gericht:</strong> {legalCase.court}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getImpactBadgeColor(legalCase.impactLevel)}>
                      {legalCase.impactLevel?.toUpperCase() || 'UNKNOWN'} IMPACT
                    </Badge>
                    <Badge variant="outline">
                      {legalCase.jurisdiction}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                    <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                    <TabsTrigger value="details">Metadaten</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Fall-Identifikation</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>ID:</strong> {legalCase.id}</div>
                            <div><strong>Fall-Nummer:</strong> {legalCase.caseNumber}</div>
                            <div><strong>Titel:</strong> {legalCase.title}</div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Gerichtsdaten</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Gericht:</strong> {legalCase.court}</div>
                            <div><strong>Jurisdiktion:</strong> {legalCase.jurisdiction}</div>
                            <div><strong>Entscheidungsdatum:</strong> {new Date(legalCase.decisionDate).toLocaleDateString('de-DE')}</div>
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
                        Vollständige Zusammenfassung aus Originaldatenbank
                      </h4>
                      <div className="bg-white p-4 rounded border max-h-[500px] overflow-y-auto">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {legalCase.summary || "Keine Zusammenfassung verfügbar"}
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        Länge: {legalCase.summary?.length || 0} Zeichen
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="mt-4">
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5" />
                        Vollständiger Originalinhalt aus Datenbank
                      </h4>
                      <div className="bg-white p-4 rounded border max-h-[600px] overflow-y-auto">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {legalCase.content || "Vollständiger Inhalt wird geladen..."}
                        </div>
                      </div>
                      <p className="text-xs text-yellow-600 mt-2">
                        Länge: {legalCase.content?.length || 0} Zeichen | Quelle: Originaldatenbank
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-2">Technische Details</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Impact Level:</strong> {legalCase.impactLevel || 'Nicht angegeben'}</div>
                            <div><strong>Dokument URL:</strong> {legalCase.documentUrl ? 'Verfügbar' : 'Nicht verfügbar'}</div>
                            <div><strong>Keywords:</strong> {legalCase.keywords?.length || 0} Schlüsselwörter</div>
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-900 mb-2">Datenqualität</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Summary:</strong> {legalCase.summary ? '✓ Vorhanden' : '✗ Fehlend'}</div>
                            <div><strong>Content:</strong> {legalCase.content ? '✓ Vorhanden' : '✗ Fehlend'}</div>
                            <div><strong>Vollständigkeit:</strong> {
                              (legalCase.summary && legalCase.content) ? '✓ Vollständig' : '⚠ Unvollständig'
                            }</div>
                          </div>
                        </div>
                      </div>

                      {legalCase.keywords && legalCase.keywords.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Schlüsselwörter</h4>
                          <div className="flex flex-wrap gap-2">
                            {legalCase.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="bg-white">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Success Message */}
      {refreshCasesMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Rechtsfälle erfolgreich aus Datenbank aktualisiert!</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}