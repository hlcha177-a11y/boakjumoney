import React, { useEffect, useMemo, useState } from "react";

const ledgerConfigs = {
  allowance: {
    title: "용돈 가계부",
    emoji: "🎀",
    theme: "pink",
    budgetLabel: "월용돈",
    yearlyBudgetLabel: "연용돈",
    balanceLabel: "남은 용돈",
    storageBudgetKey: "ribbon-allowances",
    storageExpenseKey: "ribbon-expenses",
    defaultBudgets: { "2026-05": 500000 },
    defaultExpenses: [
      { id: 1, date: "2026-05-01", amount: 15000, memo: "점심", category: "식비" },
      { id: 2, date: "2026-05-02", amount: 32000, memo: "버스·택시", category: "교통비" },
    ],
    categories: [
      "식비",
      "교통비",
      "생필품",
      "의류",
      "미용",
      "경조사비",
      "통신비",
      "구독",
      "보수",
      "교육비",
      "애완동물",
    ],
  },
  food: {
    title: "식비 가계부",
    emoji: "🥬",
    theme: "green",
    budgetLabel: "식비예산",
    yearlyBudgetLabel: "연식비예산",
    balanceLabel: "남은 식비예산",
    storageBudgetKey: "food-budgets",
    storageExpenseKey: "food-expenses",
    defaultBudgets: { "2026-05": 400000 },
    defaultExpenses: [
      { id: 101, date: "2026-05-01", amount: 18000, memo: "배달음식", category: "배달" },
      { id: 102, date: "2026-05-02", amount: 65000, memo: "마트 장보기", category: "장보기" },
    ],
    categories: ["배달", "장보기", "필수식재료", "외식", "카페", "간식", "반찬", "기타"],
  },
};

const themeClasses = {
  pink: {
    page: "bg-pink-50",
    main: "bg-pink-400",
    light: "bg-pink-50",
    text: "text-pink-600",
    active: "bg-pink-400 text-white",
    bar: "bg-pink-400",
    barBg: "bg-pink-100",
    border: "border-pink-100",
  },
  green: {
    page: "bg-emerald-50",
    main: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-600",
    active: "bg-emerald-500 text-white",
    bar: "bg-emerald-500",
    barBg: "bg-emerald-100",
    border: "border-emerald-100",
  },
};

function makeMonths(year) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
}

function formatWon(value) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function monthKey(date) {
  return date.slice(0, 7);
}

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export default function RibbonBudgetApp() {
  const today = "2026-05-02";

  const [ledgerType, setLedgerType] = useState("allowance");
  const [ledgerMenuOpen, setLedgerMenuOpen] = useState(false);
  const config = ledgerConfigs[ledgerType];
  const theme = themeClasses[config.theme];

  const [view, setView] = useState("budget");
  const [selectedYear, setSelectedYear] = useState(Number(today.slice(0, 4)));
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [budgets, setBudgets] = useState(() => loadData(config.storageBudgetKey, config.defaultBudgets));
  const [expenses, setExpenses] = useState(() => loadData(config.storageExpenseKey, config.defaultExpenses));
  const [budgetInput, setBudgetInput] = useState(String(budgets[selectedMonth] || ""));
  const [form, setForm] = useState({
    date: today,
    category: config.categories[0],
    amount: "",
    memo: "",
  });

  useEffect(() => {
    const nextConfig = ledgerConfigs[ledgerType];
    setBudgets(loadData(nextConfig.storageBudgetKey, nextConfig.defaultBudgets));
    setExpenses(loadData(nextConfig.storageExpenseKey, nextConfig.defaultExpenses));
    setForm((prev) => ({ ...prev, category: nextConfig.categories[0], amount: "", memo: "" }));
    setView("budget");
  }, [ledgerType]);

  useEffect(() => {
    localStorage.setItem(config.storageBudgetKey, JSON.stringify(budgets));
  }, [budgets, config.storageBudgetKey]);

  useEffect(() => {
    localStorage.setItem(config.storageExpenseKey, JSON.stringify(expenses));
  }, [expenses, config.storageExpenseKey]);

  useEffect(() => {
    setBudgetInput(String(budgets[selectedMonth] || ""));
  }, [selectedMonth, budgets]);

  const months = useMemo(() => makeMonths(selectedYear), [selectedYear]);
  const selectedBudget = budgets[selectedMonth] || 0;

  const monthlyExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === selectedMonth),
    [expenses, selectedMonth]
  );

  const totalUsed = useMemo(
    () => monthlyExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthlyExpenses]
  );

  const balance = selectedBudget - totalUsed;

  const categoryTotals = useMemo(() => {
    const result = {};
    config.categories.forEach((category) => {
      result[category] = 0;
    });

    monthlyExpenses.forEach((e) => {
      result[e.category] = (result[e.category] || 0) + e.amount;
    });

    return result;
  }, [monthlyExpenses, config.categories]);

  const yearlyExpenses = useMemo(
    () => expenses.filter((e) => Number(e.date.slice(0, 4)) === selectedYear),
    [expenses, selectedYear]
  );

  const yearlyBudget = useMemo(
    () => months.reduce((sum, month) => sum + (budgets[month] || 0), 0),
    [months, budgets]
  );

  const yearlyUsed = useMemo(
    () => yearlyExpenses.reduce((sum, e) => sum + e.amount, 0),
    [yearlyExpenses]
  );

  const yearlyBalance = yearlyBudget - yearlyUsed;

  const yearlyCategoryTotals = useMemo(() => {
    const result = {};
    config.categories.forEach((category) => {
      result[category] = 0;
    });

    yearlyExpenses.forEach((e) => {
      result[e.category] = (result[e.category] || 0) + e.amount;
    });

    return result;
  }, [yearlyExpenses, config.categories]);

  const monthSummary = useMemo(() => {
    return months.map((month) => {
      const used = expenses
        .filter((e) => monthKey(e.date) === month)
        .reduce((sum, e) => sum + e.amount, 0);
      const budget = budgets[month] || 0;
      return { month, budget, used, balance: budget - used };
    });
  }, [months, expenses, budgets]);

  const dailyExpenses = useMemo(
    () => expenses.filter((e) => e.date === form.date).sort((a, b) => b.id - a.id),
    [expenses, form.date]
  );

  const saveBudget = () => {
    const amount = Number(budgetInput);
    if (Number.isNaN(amount) || amount < 0) return;

    setBudgets((prev) => ({
      ...prev,
      [selectedMonth]: amount,
    }));
  };

  const addExpense = () => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return;

    setExpenses((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: form.date,
        category: form.category,
        amount,
        memo: form.memo || "메모 없음",
      },
    ]);

    setForm((prev) => ({ ...prev, amount: "", memo: "" }));
    setSelectedMonth(monthKey(form.date));
  };

  const monthLabel = selectedMonth.replace("-", "년 ") + "월";

  const moveYear = (direction) => {
    const nextYear = selectedYear + direction;
    setSelectedYear(nextYear);
    setSelectedMonth(`${nextYear}-01`);
    setForm((prev) => ({ ...prev, date: `${nextYear}-01-01` }));
  };

  return (
    <div className={`min-h-screen ${theme.page} p-4 text-slate-800`}>
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white p-5 shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveYear(-1)}
                  className={`${theme.light} ${theme.text} rounded-full px-2 py-1 text-sm font-black`}
                  aria-label="이전 연도"
                >
                  ◀
                </button>
                <button
                  onClick={() => setLedgerMenuOpen((prev) => !prev)}
                  className="text-left text-xl font-black"
                >
                  {config.emoji} {config.title} ⌄
                </button>
                <button
                  onClick={() => moveYear(1)}
                  className={`${theme.light} ${theme.text} rounded-full px-2 py-1 text-sm font-black`}
                  aria-label="다음 연도"
                >
                  ▶
                </button>
              </div>

              {ledgerMenuOpen && (
                <div className="absolute left-8 top-9 z-20 w-44 rounded-2xl bg-white p-2 shadow-lg">
                  {Object.entries(ledgerConfigs).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setLedgerType(key);
                        setLedgerMenuOpen(false);
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-bold ${
                        ledgerType === key ? theme.active : "hover:bg-slate-50"
                      }`}
                    >
                      {item.emoji} {item.title}
                    </button>
                  ))}
                </div>
              )}

              <div className={`mt-1 text-center text-xs font-bold ${theme.text}`}>{selectedYear}년</div>
              <p className="mt-1 text-sm text-slate-500">{monthLabel} {config.balanceLabel}</p>
            </div>
            <div className="text-xl">{ledgerType === "food" ? "🥬 🛒 🍚" : "💵 🛍️ ✨"}</div>
          </div>

          <div className={`mt-4 rounded-3xl ${theme.main} p-5 text-white`}>
            <div className="text-sm font-bold opacity-90">총합산</div>
            <div className="mt-1 text-3xl font-black">{formatWon(balance)}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl bg-white/20 p-3">
                <div>{config.budgetLabel}</div>
                <div className="font-bold">{formatWon(selectedBudget)}</div>
              </div>
              <div className="rounded-2xl bg-white/20 p-3">
                <div>월사용액</div>
                <div className="font-bold">- {formatWon(totalUsed)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            ["budget", ledgerType === "food" ? "식비예산" : "용돈"],
            ["expense", "지출"],
            ["monthly", "월사용액"],
            ["yearly", "연사용액"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`rounded-2xl p-2 text-sm font-bold shadow ${
                view === key ? theme.active : "bg-white text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-3xl bg-white p-4 shadow">
          <div className="mb-2 text-sm font-black">📅 월 선택</div>
          <div className="grid grid-cols-4 gap-2">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`rounded-2xl px-2 py-2 text-sm font-bold ${
                  selectedMonth === month ? theme.active : `${theme.light} text-slate-600`
                }`}
              >
                {Number(month.slice(5, 7))}월
              </button>
            ))}
          </div>
        </div>

        {view === "budget" && (
          <div className="mt-4 rounded-3xl bg-white p-5 shadow">
            <h2 className="text-lg font-black">💰 {config.budgetLabel} 입력</h2>
            <p className="mt-1 text-sm text-slate-500">선택한 달의 {config.budgetLabel}을 저장하면 총합산에 바로 반영돼요.</p>

            <div className={`mt-4 rounded-2xl ${theme.light} p-3 text-sm font-bold ${theme.text}`}>
              선택한 달: {monthLabel}
            </div>

            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder={ledgerType === "food" ? "예: 400000" : "예: 500000"}
              className={`mt-4 w-full rounded-2xl border ${theme.border} ${theme.light} px-4 py-3 outline-none`}
            />

            <button
              onClick={saveBudget}
              className={`mt-3 w-full rounded-2xl ${theme.main} p-3 font-black text-white`}
            >
              {config.budgetLabel} 저장하기
            </button>
          </div>
        )}

        {view === "expense" && (
          <div className="mt-4 rounded-3xl bg-white p-5 shadow">
            <h2 className="text-lg font-black">🧾 지출 입력</h2>
            <p className="mt-1 text-sm text-slate-500">지출을 추가하면 해당 월의 총합산이 자동으로 줄어들어요.</p>

            <div className="mt-4 space-y-3">
              <input
                type="date"
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value });
                  setSelectedMonth(monthKey(e.target.value));
                }}
                className={`w-full rounded-2xl border ${theme.border} px-4 py-3 outline-none`}
              />

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`w-full rounded-2xl border ${theme.border} px-4 py-3 outline-none`}
              >
                {config.categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="사용 금액"
                className={`w-full rounded-2xl border ${theme.border} px-4 py-3 outline-none`}
              />

              <input
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                placeholder="어디에 썼는지 메모"
                className={`w-full rounded-2xl border ${theme.border} px-4 py-3 outline-none`}
              />

              <button
                onClick={addExpense}
                className="w-full rounded-2xl bg-slate-900 p-3 font-black text-white"
              >
                지출 추가하기
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="font-black">선택한 날짜의 지출</h3>
              {dailyExpenses.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                  아직 지출 내역이 없어요
                </div>
              ) : (
                dailyExpenses.map((expense) => (
                  <div key={expense.id} className={`flex items-center justify-between rounded-2xl ${theme.light} p-3`}>
                    <div>
                      <div className="font-bold">{expense.memo}</div>
                      <div className="text-xs text-slate-400">{expense.category}</div>
                    </div>
                    <div className="font-black text-rose-500">- {formatWon(expense.amount)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === "monthly" && (
          <div className="mt-4 rounded-3xl bg-white p-5 shadow">
            <h2 className="text-lg font-black">📊 월사용액</h2>
            <p className="mt-1 text-sm text-slate-500">선택한 연도의 달별 사용액을 눌러서 확인할 수 있어요.</p>

            <div className={`mt-4 rounded-3xl ${theme.light} p-4`}>
              <div className="flex justify-between text-sm">
                <span className="font-bold">선택 월</span>
                <span className={`font-black ${theme.text}`}>{monthLabel}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="font-bold">총사용액</span>
                <span className="font-black text-rose-500">{formatWon(totalUsed)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="font-bold">{config.balanceLabel}</span>
                <span className="font-black text-slate-800">{formatWon(balance)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {config.categories.map((category) => {
                const amount = categoryTotals[category] || 0;
                const percent = totalUsed ? Math.round((amount / totalUsed) * 100) : 0;

                return (
                  <div key={category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-bold">{category}</span>
                      <span className="text-slate-500">{formatWon(amount)} · {percent}%</span>
                    </div>
                    <div className={`h-3 overflow-hidden rounded-full ${theme.barBg}`}>
                      <div
                        className={`h-full rounded-full ${theme.bar}`}
                        style={{ width: percent + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "yearly" && (
          <div className="mt-4 rounded-3xl bg-white p-5 shadow">
            <h2 className="text-lg font-black">📈 연사용액</h2>
            <p className="mt-1 text-sm text-slate-500">{selectedYear}년 1월부터 12월까지 누적으로 볼 수 있어요.</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <div className="text-slate-400">{config.yearlyBudgetLabel}</div>
                <div className="mt-1 font-black text-emerald-600">{formatWon(yearlyBudget)}</div>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3">
                <div className="text-slate-400">연사용액</div>
                <div className="mt-1 font-black text-rose-500">{formatWon(yearlyUsed)}</div>
              </div>
              <div className={`${theme.light} rounded-2xl p-3`}>
                <div className="text-slate-400">연잔액</div>
                <div className={`mt-1 font-black ${theme.text}`}>{formatWon(yearlyBalance)}</div>
              </div>
            </div>

            <div className={`mt-5 rounded-3xl ${theme.light} p-4`}>
              <h3 className="mb-3 font-black">월별 누적표</h3>
              <div className="space-y-2">
                {monthSummary.map((row) => (
                  <button
                    key={row.month}
                    onClick={() => {
                      setSelectedMonth(row.month);
                      setView("monthly");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl bg-white p-3 text-left shadow-sm"
                  >
                    <span className="font-bold">{Number(row.month.slice(5, 7))}월</span>
                    <span className="text-xs text-slate-500">
                      사용 {formatWon(row.used)} / 잔액 {formatWon(row.balance)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <h3 className="font-black">카테고리별 연간 누적</h3>
              {config.categories.map((category) => {
                const amount = yearlyCategoryTotals[category] || 0;
                const percent = yearlyUsed ? Math.round((amount / yearlyUsed) * 100) : 0;

                return (
                  <div key={category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-bold">{category}</span>
                      <span className="text-slate-500">{formatWon(amount)} · {percent}%</span>
                    </div>
                    <div className={`h-3 overflow-hidden rounded-full ${theme.barBg}`}>
                      <div
                        className={`h-full rounded-full ${theme.bar}`}
                        style={{ width: percent + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
