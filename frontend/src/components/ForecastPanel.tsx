'use client';

import { useState } from 'react';
import { useAccountsMock } from '@/hooks/useAccountsMock'; // Import your actual hook
import { useAccountForecast, useAggregateForecast } from '@/hooks/useForecastMock'; // Change to useForecast for real data
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

type ForecastType = 'account' | 'aggregate';

export default function ForecastPanel() {
    const [forecastType, setForecastType] = useState<ForecastType>('aggregate');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [forecastDays, setForecastDays] = useState(30);

    // Fetch all accounts with a large limit to get all accounts for the dropdown
    const {data: accountsData, loading: accountsLoading} = useAccountsMock({
        limit: 100,
        autoFetch: true
    });

    const {data: accountForecast, loading: accountLoading, error: accountError} =
        useAccountForecast(selectedAccountId, forecastDays);
    const {data: aggregateForecast, loading: aggregateLoading, error: aggregateError} =
        useAggregateForecast(forecastDays);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getChartData = () => {
        if (forecastType === 'account' && accountForecast) {
            return {
                labels: accountForecast.predictions.map(p => {
                    const date = new Date(p.date);
                    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
                }),
                datasets: [
                    {
                        label: 'Predicted Balance',
                        data: accountForecast.predictions.map(p => p.predicted_balance),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                    },
                    {
                        label: 'Upper Bound',
                        data: accountForecast.predictions.map(p => p.upper_bound),
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: '+1',
                        tension: 0.4,
                        borderDash: [5, 5],
                        pointRadius: 0,
                    },
                    {
                        label: 'Lower Bound',
                        data: accountForecast.predictions.map(p => p.lower_bound),
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: false,
                        tension: 0.4,
                        borderDash: [5, 5],
                        pointRadius: 0,
                    },
                ],
            };
        } else if (forecastType === 'aggregate' && aggregateForecast) {
            return {
                labels: aggregateForecast.predictions.map(p => {
                    const date = new Date(p.date);
                    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
                }),
                datasets: [
                    {
                        label: 'Predicted Deposits',
                        data: aggregateForecast.predictions.map(p => p.predicted_deposits),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                    },
                    {
                        label: 'Upper Bound',
                        data: aggregateForecast.predictions.map(p => p.upper_bound),
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: '+1',
                        tension: 0.4,
                        borderDash: [5, 5],
                        pointRadius: 0,
                    },
                    {
                        label: 'Lower Bound',
                        data: aggregateForecast.predictions.map(p => p.lower_bound),
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: false,
                        tension: 0.4,
                        borderDash: [5, 5],
                        pointRadius: 0,
                    },
                ],
            };
        }
        return null;
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                    }
                }
            },
            title: {
                display: true,
                text: forecastType === 'account'
                    ? 'Account Balance Forecast'
                    : 'Aggregate Deposits Forecast',
                font: {
                    size: 18,
                    weight: 'bold' as const,
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                },
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function (value: any) {
                        return formatCurrency(value);
                    },
                    font: {
                        size: 11,
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                ticks: {
                    maxTicksLimit: 15,
                    font: {
                        size: 11,
                    }
                },
                grid: {
                    display: false,
                }
            }
        },
    };

    const chartData = getChartData();
    const loading = forecastType === 'account' ? accountLoading : aggregateLoading;
    const error = forecastType === 'account' ? accountError : aggregateError;

    // Get accounts array from the response
    const accounts = accountsData?.accounts || [];

    // Get selected account details
    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

    // Calculate change from current balance
    const getBalanceChange = () => {
        if (!accountForecast) return null;
        const currentBalance = accountForecast.current_balance;
        const finalBalance = accountForecast.predictions[accountForecast.predictions.length - 1]?.predicted_balance || 0;
        const change = finalBalance - currentBalance;
        const percentChange = (change / currentBalance) * 100;
        return {change, percentChange};
    };

    const balanceChange = getBalanceChange();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🔮</span>
                    <h2 className="text-3xl font-bold">
                        Financial Forecasting
                    </h2>
                </div>
                <p className="text-blue-100">
                    AI-powered predictions using Facebook Prophet machine learning algorithm
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Forecast Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Forecast Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setForecastType('aggregate')}
                                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                    forecastType === 'aggregate'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <div className="text-lg mb-1">🏦</div>
                                <div className="text-xs">Aggregate</div>
                            </button>
                            <button
                                onClick={() => setForecastType('account')}
                                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                    forecastType === 'account'
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <div className="text-lg mb-1">💳</div>
                                <div className="text-xs">Account</div>
                            </button>
                        </div>
                    </div>

                    {/* Account Selection (only for account forecast) */}
                    {forecastType === 'account' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Account
                            </label>
                            <select
                                value={selectedAccountId || ''}
                                onChange={(e) => setSelectedAccountId(e.target.value || null)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                disabled={accountsLoading}
                            >
                                <option value="">Choose an account...</option>
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name} ({account.type}) - {formatCurrency(account.balance)}
                                    </option>
                                ))}
                            </select>
                            {accountsLoading && (
                                <p className="text-xs text-gray-500 mt-1">Loading accounts...</p>
                            )}
                        </div>
                    )}

                    {/* Forecast Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Forecast Period
                        </label>
                        <select
                            value={forecastDays}
                            onChange={(e) => setForecastDays(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value={7}>7 days (1 week)</option>
                            <option value={14}>14 days (2 weeks)</option>
                            <option value={30}>30 days (1 month)</option>
                            <option value={60}>60 days (2 months)</option>
                            <option value={90}>90 days (3 months)</option>
                            <option value={180}>180 days (6 months)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Account Forecast Summary Stats */}
            {forecastType === 'account' && accountForecast && selectedAccount && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Current Balance</p>
                            <span className="text-2xl">💰</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(accountForecast.current_balance)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{selectedAccount.name}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Predicted ({forecastDays}d)</p>
                            <span className="text-2xl">📈</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(accountForecast.predictions[accountForecast.predictions.length - 1]?.predicted_balance || 0)}
                        </p>
                        {balanceChange && (
                            <p className={`text-xs mt-1 font-medium ${balanceChange.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {balanceChange.change >= 0 ? '+' : ''}{formatCurrency(balanceChange.change)}
                                ({balanceChange.percentChange.toFixed(1)}%)
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Best Case</p>
                            <span className="text-2xl">📊</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(accountForecast.predictions[accountForecast.predictions.length - 1]?.upper_bound || 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Upper confidence bound</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border-l-4 border-orange-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Worst Case</p>
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">
                            {formatCurrency(accountForecast.predictions[accountForecast.predictions.length - 1]?.lower_bound || 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Lower confidence bound</p>
                    </div>
                </div>
            )}

            {/* Aggregate Forecast Summary Stats */}
            {forecastType === 'aggregate' && aggregateForecast && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Avg Daily Deposits</p>
                            <span className="text-2xl">💵</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(aggregateForecast.summary.avg_predicted_daily_deposits)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Predicted average per day</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Predicted</p>
                            <span className="text-2xl">🏦</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(aggregateForecast.summary.total_predicted_deposits)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Next {forecastDays} days</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Data Points</p>
                            <span className="text-2xl">📊</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                            {aggregateForecast.historical_data_points}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Historical days analyzed</p>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {loading && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div
                                className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Generating forecast...</p>
                            <p className="text-gray-500 text-sm mt-1">Analyzing patterns with AI</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className="text-red-600 font-semibold mb-2">Error Loading Forecast</p>
                            <p className="text-gray-600 text-sm bg-red-50 p-3 rounded">{error}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && forecastType === 'account' && !selectedAccountId && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💳</div>
                            <p className="text-gray-600 font-medium mb-2">Select an Account</p>
                            <p className="text-gray-500 text-sm">Choose an account from the dropdown to view balance
                                forecast</p>
                        </div>
                    </div>
                )}

                {!loading && !error && chartData && (
                    <div className="h-96">
                        <Line data={chartData} options={chartOptions}/>
                    </div>
                )}
            </div>

            {/* Model Information */}
            {forecastType === 'account' && accountForecast && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        Model Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Algorithm</p>
                            <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                                <span
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    {accountForecast.model_info.algorithm}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Training Period</p>
                            <p className="text-base font-medium text-gray-900">
                                {accountForecast.model_info.training_period}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 mb-2">Features & Seasonality</p>
                            <div className="flex flex-wrap gap-2">
                                {accountForecast.model_info.features.map((feature) => (
                                    <span
                                        key={feature}
                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1"
                                    >
                                        <span className="text-xs">✨</span>
                                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 mb-2">Historical Data</p>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Data points used for training:</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {accountForecast.historical_data_points} days
                                    </span>
                                </div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                        style={{width: `${Math.min((accountForecast.historical_data_points / 365) * 100, 100)}%`}}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {accountForecast.historical_data_points >= 90
                                        ? '✅ Excellent data quality for accurate predictions'
                                        : accountForecast.historical_data_points >= 30
                                            ? '⚠️ Moderate data - predictions may vary'
                                            : '❌ Limited data - use predictions with caution'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Aggregate Model Information */}
            {forecastType === 'aggregate' && aggregateForecast && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        Model Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Algorithm</p>
                            <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                                <span
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                    Facebook Prophet
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Forecast Type</p>
                            <p className="text-base font-medium text-gray-900">
                                {aggregateForecast.forecast_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 mb-2">Historical Data</p>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Data points analyzed:</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {aggregateForecast.historical_data_points} days
                                    </span>
                                </div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                        style={{width: `${Math.min((aggregateForecast.historical_data_points / 365) * 100, 100)}%`}}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {aggregateForecast.historical_data_points >= 90
                                        ? '✅ Excellent data quality for accurate predictions'
                                        : aggregateForecast.historical_data_points >= 30
                                            ? '⚠️ Moderate data - predictions may vary'
                                            : '❌ Limited data - use predictions with caution'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prediction Table */}
            {!loading && !error && (forecastType === 'account' ? accountForecast : aggregateForecast) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        Detailed Predictions
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {forecastType === 'account' ? 'Predicted Balance' : 'Predicted Deposits'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lower Bound
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Upper Bound
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Confidence Range
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {(forecastType === 'account' ? accountForecast?.predictions : aggregateForecast?.predictions)
                                ?.slice(0, 10)
                                .map((prediction, index) => {
                                    const value = forecastType === 'account'
                                        ? prediction.predicted_balance
                                        : prediction.predicted_deposits;
                                    const range = prediction.upper_bound - prediction.lower_bound;

                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(prediction.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                {formatCurrency(value || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                                                {formatCurrency(prediction.lower_bound)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                {formatCurrency(prediction.upper_bound)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ±{formatCurrency(range / 2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {((forecastType === 'account' ? accountForecast?.predictions : aggregateForecast?.predictions)?.length || 0) > 10 && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">
                                Showing first 10
                                of {forecastType === 'account' ? accountForecast?.predictions.length : aggregateForecast?.predictions.length} predictions
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Disclaimer */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                            Forecast Disclaimer
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>
                                These predictions are generated using machine learning models based on historical data
                                patterns.
                                Actual results may vary significantly due to unforeseen circumstances, market
                                conditions, or changes in behavior.
                                Use these forecasts as guidance only and not as guaranteed outcomes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}