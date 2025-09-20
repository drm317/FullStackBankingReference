import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Account } from '../types';
import { accountService } from '../services/api';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ArrowTrendingUpIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <CreditCardIcon className="w-8 h-8 text-blue-600" />;
      case 'savings':
        return <BanknotesIcon className="w-8 h-8 text-green-600" />;
      case 'credit':
        return <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />;
      default:
        return <CreditCardIcon className="w-8 h-8 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg text-white p-6">
          <h3 className="text-lg font-medium mb-2">Total Balance</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getAccountIcon(account.accountType)}
                  <div className="ml-3">
                    <h4 className="text-lg font-medium capitalize">
                      {account.accountType} Account
                    </h4>
                    <p className="text-sm text-gray-600">
                      •••• {account.accountNumber.slice(-4)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  account.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {account.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(account.balance)}
                </p>
                <p className="text-sm text-gray-600">{account.currency}</p>
              </div>

              {account.interestRate && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Interest Rate: {(account.interestRate * 100).toFixed(2)}%
                  </p>
                </div>
              )}

              <Link
                to={`/account/${account._id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/transfer"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Transfer Money
            </Link>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
              Pay Bills
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
              Deposit Check
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;