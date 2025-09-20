import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Account, Transaction } from '../types';
import { accountService } from '../services/api';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

const AccountDetails: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!accountId) return;
      
      try {
        const [accountData, transactionData] = await Promise.all([
          accountService.getAccount(accountId),
          accountService.getAccountTransactions(accountId, currentPage)
        ]);
        
        setAccount(accountData);
        setTransactions(transactionData.transactions);
        setTotalPages(transactionData.pagination.pages);
      } catch (error) {
        console.error('Failed to fetch account data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [accountId, currentPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transaction: Transaction) => {
    const isIncoming = transaction.toAccountId === accountId;
    return isIncoming ? (
      <ArrowDownIcon className="w-5 h-5 text-green-600" />
    ) : (
      <ArrowUpIcon className="w-5 h-5 text-red-600" />
    );
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const isIncoming = transaction.toAccountId === accountId;
    const sign = isIncoming ? '+' : '-';
    return `${sign}${formatCurrency(transaction.amount)}`;
  };

  const getTransactionColor = (transaction: Transaction) => {
    const isIncoming = transaction.toAccountId === accountId;
    return isIncoming ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <Layout title="Account Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!account) {
    return (
      <Layout title="Account Details">
        <div className="text-center py-12">
          <p className="text-gray-600">Account not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account`}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Account Number</dt>
                  <dd className="text-sm text-gray-900">{account.accountNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Account Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{account.accountType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Status</dt>
                  <dd className={`text-sm ${
                    account.status === 'active' ? 'text-green-600' : 'text-red-600'
                  } capitalize`}>
                    {account.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Currency</dt>
                  <dd className="text-sm text-gray-900">{account.currency}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Balance</h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(account.balance)}
              </p>
              {account.interestRate && (
                <p className="text-sm text-gray-600 mt-2">
                  Interest Rate: {(account.interestRate * 100).toFixed(2)}%
                </p>
              )}
              {account.overdraftLimit && (
                <p className="text-sm text-gray-600 mt-1">
                  Overdraft Limit: {formatCurrency(account.overdraftLimit)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-600">
                No transactions found
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.reference} • {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getTransactionColor(transaction)}`}>
                        {getTransactionAmount(transaction)}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AccountDetails;