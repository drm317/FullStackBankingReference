import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { Account, TransactionRequest } from '../types';
import { accountService, transactionService } from '../services/api';

interface TransferForm {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}

const TransferPage: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<TransferForm>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fromAccountId = watch('fromAccountId');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data.filter(account => account.status === 'active'));
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        toast.error('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const onSubmit = async (data: TransferForm) => {
    try {
      await transactionService.transfer(data);
      toast.success('Transfer completed successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Transfer failed');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const availableToAccounts = accounts.filter(account => account._id !== fromAccountId);
  const selectedFromAccount = accounts.find(account => account._id === fromAccountId);

  if (loading) {
    return (
      <Layout title="Transfer Money">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Transfer Money">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              <select
                {...register('fromAccountId', { required: 'Please select a source account' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountType.toUpperCase()} - •••• {account.accountNumber.slice(-4)} 
                    ({formatCurrency(account.balance)})
                  </option>
                ))}
              </select>
              {errors.fromAccountId && (
                <p className="mt-1 text-sm text-red-600">{errors.fromAccountId.message}</p>
              )}
            </div>

            {selectedFromAccount && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  Available balance: <span className="font-medium">{formatCurrency(selectedFromAccount.balance)}</span>
                </p>
              </div>
            )}

            <div>
              <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700 mb-2">
                To Account
              </label>
              <select
                {...register('toAccountId', { required: 'Please select a destination account' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={!fromAccountId}
              >
                <option value="">Select account</option>
                {availableToAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountType.toUpperCase()} - •••• {account.accountNumber.slice(-4)}
                  </option>
                ))}
              </select>
              {errors.toAccountId && (
                <p className="mt-1 text-sm text-red-600">{errors.toAccountId.message}</p>
              )}
              {!fromAccountId && (
                <p className="mt-1 text-sm text-gray-500">Please select a source account first</p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be at least $0.01' },
                    max: selectedFromAccount ? { 
                      value: selectedFromAccount.balance, 
                      message: 'Amount cannot exceed available balance' 
                    } : undefined
                  })}
                  type="number"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                {...register('description', { 
                  required: 'Description is required',
                  maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="What's this transfer for?"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Transfer Money'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default TransferPage;