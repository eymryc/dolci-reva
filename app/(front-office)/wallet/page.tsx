"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Wallet, CreditCard, RefreshCw, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import api from '@/lib/axios';

interface Transaction {
  id: number;
  reference: string;
  amount: string;
  type: 'CREDIT' | 'DEBIT';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  description?: string;
  created_at: string;
}

export default function WalletPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    // Lire les paramètres de l'URL
    const payment = searchParams.get('payment');
    const ref = searchParams.get('reference');
    const paymentStatus = searchParams.get('status');

    if (payment && ref) {
      setPaymentStatus(payment);
      setReference(ref);
      setStatus(paymentStatus || null);
      setShowMessage(true);

      if (payment === 'success') {
        toast.success('Paiement effectué avec succès !', {
          description: `Référence: ${ref}`,
        });
      } else if (payment === 'failed') {
        toast.error('Le paiement a échoué', {
          description: `Référence: ${ref}`,
        });
      }

      // Rafraîchir le solde du wallet
      refreshWallet();
    }
  }, [searchParams, refreshUser]);

  // Fetch wallet balance and transactions
  const refreshWallet = async () => {
    try {
      setIsLoadingTransactions(true);
      
      // Refresh user data to get updated wallet balance
      await refreshUser();
      
      // Fetch transactions
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data.data || []);
      
      // Update wallet balance from user data
      if (user?.wallet) {
        setWalletBalance(user.wallet.balance);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Erreur lors du chargement des données du wallet');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (user?.wallet) {
      setWalletBalance(user.wallet.balance);
    }
  }, [user]);

  useEffect(() => {
    // Load transactions on mount
    refreshWallet();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format price
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder à votre wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/sign-in">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Success/Failed Message Banner */}
        {showMessage && paymentStatus && (
          <Card className={`mb-6 ${
            paymentStatus === 'success' 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {paymentStatus === 'success' ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    paymentStatus === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {paymentStatus === 'success' 
                      ? 'Paiement effectué avec succès !' 
                      : 'Le paiement a échoué'}
                  </h3>
                  <p className={`mb-4 ${
                    paymentStatus === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {paymentStatus === 'success' 
                      ? 'Votre wallet a été crédité avec succès. Le solde a été mis à jour.'
                      : 'Votre paiement n\'a pas pu être traité. Veuillez réessayer ou contacter le support si le problème persiste.'}
                  </p>
                  {reference && (
                    <div className="mb-4">
                      <p className={`text-sm font-mono ${
                        paymentStatus === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Référence: {reference}
                      </p>
                      {status && paymentStatus === 'failed' && (
                        <p className="text-sm text-red-600 mt-1">
                          Statut: {status}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowMessage(false)}
                      className={
                        paymentStatus === 'success'
                          ? 'border-green-300 text-green-700 hover:bg-green-100'
                          : 'border-red-300 text-red-700 hover:bg-red-100'
                      }
                    >
                      Fermer
                    </Button>
                    {paymentStatus === 'failed' && (
                      <Link href="/support">
                        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                          Contacter le support
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Wallet</h1>
          <p className="text-gray-600">
            Gérez votre solde et consultez vos transactions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Wallet Balance Card */}
          <Card className="md:col-span-2 bg-gradient-to-br from-theme-primary to-orange-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="w-6 h-6" />
                Solde disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {formatPrice(walletBalance)}
                </span>
                <span className="text-xl opacity-90">FCFA</span>
              </div>
              <p className="text-sm opacity-80 mt-2">
                Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={refreshWallet}
                  disabled={isLoadingTransactions}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-theme-primary to-orange-500 hover:from-orange-500 hover:to-theme-primary">
                <CreditCard className="w-4 h-4 mr-2" />
                Recharger le wallet
              </Button>
              <Link href="/bookings">
                <Button variant="outline" className="w-full">
                  Mes réservations
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Historique des transactions
            </CardTitle>
            <CardDescription>
              Consultez toutes vos transactions récentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune transaction
                </h3>
                <p className="text-gray-600">
                  Vous n&apos;avez pas encore de transactions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'CREDIT'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'CREDIT' ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {transaction.description || 
                           (transaction.type === 'CREDIT' ? 'Crédit' : 'Débit')}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          {transaction.reference}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}
                        {formatPrice(transaction.amount)} FCFA
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === 'SUCCESS'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'SUCCESS' ? 'Réussi' : 
                         transaction.status === 'FAILED' ? 'Échoué' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

