import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin, LLMProvider, LLMModel } from '../hooks/useAdmin';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

// --- Provider Dialog --- //
const emptyProvider: Omit<LLMProvider, 'id' | 'created_at'> = {
  name: '',
  api_endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  api_key_encrypted: '',
  status: 'active',
  priority: 10,
};

const ProviderManager = () => {
  const { loading, providers, getProviders, addProvider, updateProvider, deleteProvider } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Partial<LLMProvider>>(emptyProvider);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getProviders();
  }, [getProviders]);

  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedProvider(emptyProvider);
    setIsDialogOpen(true);
  };

  const handleEdit = (provider: LLMProvider) => {
    setIsEditing(true);
    setSelectedProvider(provider);
    setIsDialogOpen(true);
  };

  const handleDelete = async (providerId: string) => {
    if (window.confirm('Bu providerı ve ilişkili tüm modelleri silmek istediğinizden emin misiniz?')) {
      await deleteProvider(providerId);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedProvider.name || !selectedProvider.api_key_encrypted) {
      toast.error('Lütfen Provider Adı ve API Anahtarı alanlarını doldurun.');
      return;
    }
    if (isEditing) {
      await updateProvider(selectedProvider as LLMProvider);
    } else {
      await addProvider(selectedProvider as Omit<LLMProvider, 'id'>);
    }
    setIsDialogOpen(false);
  };

  return (
    <Card className="border-slate-700 bg-slate-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>LLM Provider Yönetimi</CardTitle>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Provider Ekle
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-600 hover:bg-slate-700">
              <TableHead className="text-white">Provider Adı</TableHead>
              <TableHead className="text-white">Durum</TableHead>
              <TableHead className="text-white">Öncelik</TableHead>
              <TableHead className="text-right text-white">Eylemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && providers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
            ) : (
              providers.map((provider) => (
                <TableRow key={provider.id} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell>{provider.name}</TableCell>
                  <TableCell><Badge className={provider.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>{provider.status}</Badge></TableCell>
                  <TableCell>{provider.priority}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(provider)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(provider.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Provider Düzenle' : 'Yeni Provider Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Ad</Label>
              <Input id="name" name="name" value={selectedProvider.name || ''} onChange={(e) => setSelectedProvider(p => ({...p, name: e.target.value}))} className="col-span-3 bg-slate-700"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api_key_encrypted" className="text-right">API Anahtarı</Label>
              <Input id="api_key_encrypted" name="api_key_encrypted" type="password" value={selectedProvider.api_key_encrypted || ''} onChange={(e) => setSelectedProvider(p => ({...p, api_key_encrypted: e.target.value}))} className="col-span-3 bg-slate-700"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Öncelik</Label>
              <Input id="priority" name="priority" type="number" value={selectedProvider.priority || 10} onChange={(e) => setSelectedProvider(p => ({...p, priority: parseInt(e.target.value, 10)}))} className="col-span-3 bg-slate-700"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Durum</Label>
              <Select value={selectedProvider.status} onValueChange={(value) => setSelectedProvider(p => ({...p, status: value as LLMProvider['status']}))}>
                <SelectTrigger className="col-span-3 bg-slate-700"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-700 text-white"><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Pasif</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">İptal</Button>
            <Button onClick={handleSaveChanges} disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Kaydet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// --- Model Dialog --- //
const emptyModel: Omit<LLMModel, 'id'> = {
    provider_id: '',
    model_name: '',
    display_name: '',
    cost_per_1k_tokens: 0,
    max_tokens: 4096,
    status: 'active',
    is_default: false,
};

const ModelManager = () => {
    const { loading, models, providers, getModels, addModel, updateModel, deleteModel } = useAdmin();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<Partial<LLMModel>>(emptyModel);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        getModels();
    }, [getModels]);

    const handleAddNew = () => {
        setIsEditing(false);
        setSelectedModel(emptyModel);
        setIsDialogOpen(true);
    };

    const handleEdit = (model: LLMModel) => {
        setIsEditing(true);
        setSelectedModel(model);
        setIsDialogOpen(true);
    };

    const handleDelete = async (modelId: string) => {
        if (window.confirm('Bu modeli silmek istediğinizden emin misiniz?')) {
            await deleteModel(modelId);
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedModel.provider_id || !selectedModel.display_name || !selectedModel.model_name) {
            toast.error('Lütfen Provider, Model Adı ve Model Kodu alanlarını doldurun.');
            return;
        }
        if (isEditing) {
            await updateModel(selectedModel as LLMModel);
        } else {
            await addModel(selectedModel as Omit<LLMModel, 'id'>);
        }
        setIsDialogOpen(false);
    };

    return (
        <Card className="border-slate-700 bg-slate-800 text-white mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>LLM Model Yönetimi</CardTitle>
                <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Model Ekle
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-600 hover:bg-slate-700">
                            <TableHead className="text-white">Model Adı</TableHead>
                            <TableHead className="text-white">Provider</TableHead>
                            <TableHead className="text-white">Durum</TableHead>
                            <TableHead className="text-white">Varsayılan</TableHead>
                            <TableHead className="text-right text-white">Eylemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && models.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
                        ) : (
                            models.map((model) => (
                                <TableRow key={model.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell>{model.display_name}</TableCell>
                                    <TableCell>{model.llm_providers?.name || 'Bilinmiyor'}</TableCell>
                                    <TableCell><Badge className={model.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'}>{model.status}</Badge></TableCell>
                                    <TableCell>{model.is_default ? 'Evet' : 'Hayır'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(model)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(model.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Modeli Düzenle' : 'Yeni Model Ekle'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="provider_id" className="text-right">Provider</Label>
                            <Select value={selectedModel.provider_id} onValueChange={(value) => setSelectedModel(m => ({...m, provider_id: value}))}>
                                <SelectTrigger className="col-span-3 bg-slate-700"><SelectValue placeholder="Provider seçin..." /></SelectTrigger>
                                <SelectContent className="bg-slate-700 text-white">
                                    {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="display_name" className="text-right">Model Adı</Label>
                            <Input id="display_name" name="display_name" value={selectedModel.display_name || ''} onChange={(e) => setSelectedModel(m => ({...m, display_name: e.target.value}))} className="col-span-3 bg-slate-700"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="model_name" className="text-right">Model Kodu</Label>
                            <Input id="model_name" name="model_name" value={selectedModel.model_name || ''} onChange={(e) => setSelectedModel(m => ({...m, model_name: e.target.value}))} className="col-span-3 bg-slate-700" placeholder="örn: deepseek/deepseek-r1"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Durum</Label>
                            <Select value={selectedModel.status} onValueChange={(value) => setSelectedModel(m => ({...m, status: value as LLMModel['status']}))}>
                                <SelectTrigger className="col-span-3 bg-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-700 text-white"><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Pasif</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-end space-x-2 pt-4">
                            <Label htmlFor="is_default">Varsayılan Model mi?</Label>
                            <Switch id="is_default" checked={selectedModel.is_default} onCheckedChange={(checked) => setSelectedModel(m => ({...m, is_default: checked}))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)} variant="outline">İptal</Button>
                        <Button onClick={handleSaveChanges} disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Kaydet'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default function AdminLLMPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
        <div className="flex items-center mb-8">
            <BrainCircuit className="h-8 w-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">LLM Yapılandırması</h1>
        </div>
        <ProviderManager />
        <ModelManager />
    </div>
  );
}