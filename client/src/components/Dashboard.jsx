import { useAuth } from './AuthProvider'
import '../styles/Dashboard.css';
import { useEffect, useState } from 'react';
import { CURRENCY_SYMBOLS } from '../constants';
import { getTotalExpensesAmount } from '../api/expense';
import { getTotalIncomesAmount } from '../api/income';
import { LineChart, BarChart } from './charts';

export const Dashboard = () => {
  const { user } = useAuth();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const expensesAmount = await getTotalExpensesAmount(user.id);
      const incomesAmount = await getTotalIncomesAmount(user.id);
      setTotalExpenses(expensesAmount.totalAmount);
      setTotalIncomes(incomesAmount.totalAmount);
    };

    fetchData();
  }, [])
  return (
    <div className='dashboard'>
      <header className='dashboard-header'>
        <h1>Welcome {user.fullName}</h1>
      </header>

      <div className='summary'>
        <div className='card income'>
          <h2>Total Incomes</h2>
          <p>{totalIncomes - totalExpenses}{CURRENCY_SYMBOLS['ILS']}</p>
        </div>

        <div className='card expenses'>
          <h2>Total Expenses</h2>
          <p>{totalExpenses}{CURRENCY_SYMBOLS['ILS']}</p>
        </div>

        <div className='card balance'>
          <h2>Total Balance</h2>
          <p>{totalIncomes}{CURRENCY_SYMBOLS['ILS']}</p>
        </div>
      </div>
      <div className='charts'>
        <LineChart/>
        <BarChart/>
      </div>
    </div>
  );
};
