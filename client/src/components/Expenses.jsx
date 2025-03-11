import React, { useEffect, useRef, useState } from 'react'
import '../styles/Items.css'
import { useAuth } from './AuthProvider'
import { createExpense, getExpenses, updateExpense, deleteExpense } from '../api/expense'
import { toast } from 'react-toastify'
import { CURRENCY_SYMBOLS } from '../constants'
import { Filters } from './Filters'


export const Expenses = () => {
    const [isPending, setIsPending] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [editExpenseId, setEditExpenseId] = useState(null);
    const [inputSearch, setInputSearch] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(null);

    const { user } = useAuth();

    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const amountRef = useRef(null);
    const tagRef = useRef(null);
    const currencyRef = useRef(null);

    const maxAmount = expenses.length? Math.max(...expenses.map((expense) => expense.amount)) : 0;

    console.log(maxAmount);

    const filteredExpenses = expenses?.filter((expense) =>
    {
       const matchSearch = expense.title.toLowerCase().includes(inputSearch.toLowerCase());

       if(selectedFilter && selectedFilter.type === 'amount'){
            return(
                matchSearch &&
                expense.amount >= selectedFilter.min &&
                expense.amount <= selectedFilter.max
            )
       }

       return matchSearch;
    });

    const resetFields = () => {
        titleRef.current.value = '';
        descriptionRef.current.value = '';
        amountRef.current.value = '';
        tagRef.current.value = 'food';
        currencyRef.current.value = 'ILS';
    }

    const handleUpsert = async (e) => {
        e.preventDefault();
        const title = titleRef.current.value;
        const description = descriptionRef.current?.value;
        const amount = amountRef.current.value;
        const tag = tagRef.current.value;
        const currency = currencyRef.current.value;

        const payload = {
            userId: user.id,
            title,
            description,
            amount: Number(amount),
            tag,
            currency,
        };

        try {
            setIsPending(true)
            if (editExpenseId) {
                payload.expenseId = editExpenseId;
                const data = await updateExpense(payload);
                setExpenses((prevExpenses) => prevExpenses.map((expense) => expense._id === editExpenseId ? { ...expense, ...payload } : expense));
                toast.success(data.message);
                resetFields();
                setEditExpenseId(null);
                return;
            }
            const data = await createExpense(payload);
            toast.success(data.message);
            resetFields();
            setExpenses((prevExpenses) => [...prevExpenses, data.expense]);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsPending(false);
        }

    }

    const handleDeleteExpense = async (id) => {
        if (editExpenseId === id) {
            return;
        }
        try {
            setIsPending(true);
            const data = await deleteExpense(id, user.id);
            toast.success(data.message);
            setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense._id !== id));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsPending(false);
        }
    }

    const handleEditExpense = (expense) => {
        setEditExpenseId(expense._id);
        titleRef.current.value = expense.title;
        descriptionRef.current.value = expense.description;
        amountRef.current.value = expense.amount;
        tagRef.current.value = expense.tag;
        currencyRef.current.value = expense.currency;
    }

    useEffect(() => {
        const fetchData = async () => {
            const data = await getExpenses(user.id);
            setExpenses(data);
        };

        fetchData();
    }, [])

    return (
        <main className='expense-container'>
            <h1>Expenses</h1>
            <form onSubmit={handleUpsert}>
                <div>
                    <label htmlFor="title">Title</label>
                    <input
                        type='text'
                        ref={titleRef}
                        id='title'
                        placeholder='Enter the title'
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <input
                        type='text'
                        ref={descriptionRef}
                        id='description'
                        placeholder='Enter the description'
                    />
                </div>
                <div>
                    <label htmlFor="amount">Amount</label>
                    <input
                        type='number'
                        ref={amountRef}
                        inputMode='numeric'
                        id='amount'
                        placeholder='Enter the amount'
                        required
                    />
                </div>

                <div >
                    <label htmlFor="tag">Tag</label>
                    <select id='tag' ref={tagRef} required>
                        <option value="food">Food</option>
                        <option value="rent">Rent</option>
                        <option value="transport">Transport</option>
                        <option value="clothing">Clothing</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="health">Health</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="currency">Currency</label>
                    <select id='currency' ref={currencyRef}>
                        <option value="ILS">ILS</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
                <button type='submit' className='expense-button' disabled={isPending}>
                    {editExpenseId ? 'Update Expense' : 'Add Expense'}
                </button>
            </form>
            <Filters 
            inputSearch={inputSearch} 
            setInputSearch={setInputSearch}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            maxAmount={maxAmount}
            />
            {filteredExpenses.length ? (
                <table className='expenses-table'>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Tag</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense) => (
                            <tr key={expense._id}>
                                <td>{expense.title}</td>
                                <td>{expense.description}</td>
                                <td>{expense.amount}{CURRENCY_SYMBOLS[expense.currency]}</td>
                                <td>{expense.tag}</td>
                                <td>
                                    <div className='action-buttons'>
                                        <button className='edit-button' onClick={() => handleEditExpense(expense)}>Edit</button>
                                        <button className='delete-button' onClick={() => handleDeleteExpense(expense._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>) : inputSearch ?(
                    <p className='not-found'>"{inputSearch}" not found</p>
                ) : (
                    <p className='not-found'>No expenses found</p>
                )}
        </main>


    )
}