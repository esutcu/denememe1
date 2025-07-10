import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  recommended?: boolean;
}

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Ücretsiz',
      price: 0,
      interval: 'aylık',
      features: [
        'Günlük 5 tahmin hakkı',
        'Temel istatistikler',
        '3 günlük tahmin geçmişi'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49.99,
      interval: 'aylık',
      features: [
        'Sınırsız tahmin hakkı',
        'Detaylı analizler',
        '30 günlük tahmin geçmişi',
        'Özel bildirimler'
      ],
      recommended: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.99,
      interval: 'aylık',
      features: [
        'Tüm Pro özellikleri',
        'Özel destek',
        'Özel raporlar',
        'VIP etkinlikler'
      ]
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Mock subscription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user plan in mock data
      const updatedUser = {
        ...user,
        plan: planId
      };
      
      toast.success('Abonelik başarıyla güncellendi!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Abonelik hatası:', error);
      toast.error('Abonelik işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Abonelik Planları</h1>
          <p className="text-xl text-gray-600">İhtiyaçlarınıza uygun planı seçin ve tahminlerinizin keyfini çıkarın</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.recommended ? 'border-2 border-blue-500 transform scale-105' : 'border-gray-200'}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                  Tavsiye Edilen
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="mt-4">
                  <span className="text-4xl font-bold">₺{plan.price}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  className="w-full"
                  variant={plan.recommended ? 'default' : 'outline'}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Başla'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-600">
          <p>İptal etmek isterseniz 7/24 destek ekibimizle iletişime geçebilirsiniz.</p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;