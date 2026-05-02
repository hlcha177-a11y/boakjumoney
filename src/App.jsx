// import './index.css'; 

import React, { useState, useEffect } from 'react';
//import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Wallet, Calendar, PieChart, Trash2 } from 'lucide-react';

const RibbonBudgetApp = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('식비');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('지출');

  const categories = {
    지출: ['식비', '교통', '쇼핑', '의료', '주거', '기타'],
    수입: ['급여', '부수입', '용돈', '금융', '기타']
  };

  const addTransaction = () => {
    if (!amount || isNaN(amount)) return;
    
    const newTransaction = {
      id: Date.now(),
      amount: parseInt(amount),
      category,
      description,
      type,
      date: new Date().toLocaleDateString()
    };

    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    setDescription('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === '수입')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === '지출')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-10 font-sans">
      {/* 헤더 */}
      <div className="bg-pink-500 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet size={24} /> 보겸 머니로그
        </h1>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/20 p-3 rounded-2xl">
            <p className="text-sm opacity-80">이번 달 수입</p>
            <p className="text-xl font-bold">{totalIncome.toLocaleString()}원</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <p className="text-sm opacity-80">이번 달 지출</p>
            <p className="text-xl font-bold">{totalExpense.toLocaleString()}원</p>
          </div>
        </div>
        <div className="mt-4 text-center bg-white text-pink-600 py-2 rounded-xl font-bold shadow-md">
          잔액: {(totalIncome - totalExpense).toLocaleString()}원
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="m-4 p-4 bg-white rounded-2xl shadow-sm border border-pink-100">
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => {setType('지출'); setCategory('식비');}}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1 font-bold ${type === '지출' ? 'bg-pink-100 text-pink-600 border-2 border-pink-500' : 'bg-gray-100 text-gray-400'}`}
          >
            <MinusCircle size={18} /> 지출
          </button>
          <button 
            onClick={() => {setType('수입'); setCategory('급여');}}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1 font-bold ${type === '수입' ? 'bg-green-100 text-green-600 border-2 border-green-500' : 'bg-gray-100 text-gray-400'}`}
          >
            <PlusCircle size={18} /> 수입
          </button>
        </div>

        <div className="space-y-3">
          <input 
            type="number" 
            placeholder="금액을 입력하세요" 
            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-pink-300"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select 
            className="w-full p-3 bg-gray-50 rounded-xl outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="내용 (예: 점심 식사)" 
            className="w-full p-3 bg-gray-50 rounded-xl outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button 
            onClick={addTransaction}
            className="w-full bg-pink-500 text-white p-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            기록하기
          </button>
        </div>
      </div>

      {/* 내역 리스트 */}
      <div className="mx-4">
        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar size={20} /> 소비 내역
        </h2>
        <div className="space-y-3">
          {transactions.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border-l-4 border-pink-500">
              <div>
                <p className="text-xs text-gray-400">{t.date}</p>
                <p className="font-bold text-gray-700">{t.category} <span className="font-normal text-sm text-gray-500">- {t.description}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${t.type === '수입' ? 'text-green-500' : 'text-pink-500'}`}>
                  {t.type === '수입' ? '+' : '-'}{t.amount.toLocaleString()}원
                </span>
                <button onClick={() => deleteTransaction(t.id)} className="text-gray-300 hover:text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <PieChart size={48} className="mx-auto mb-2 opacity-20" />
              오늘의 첫 소비를 기록해 보세요!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RibbonBudgetApp;