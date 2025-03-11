import React, { useEffect, useRef, useState } from 'react'
import '../styles/Items.css'
import { useAuth } from './AuthProvider'
import { createIncome, getIncomes, updateIncome, deleteIncome } from '../api/income'
import { toast } from 'react-toastify'
import { CURRENCY_SYMBOLS } from '../constants'
import { Filters } from './Filters'


export const Incomes = () => {
    const [isPending, setIsPending] = useState(false);
    const [incomes, setIncomes] = useState([]);
    const [editIncomeId, setEditIncomeId] = useState(null);
    const [inputSearch, setInputSearch] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(null);

    const { user } = useAuth();

    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const amountRef = useRef(null);
    const tagRef = useRef(null);
    const currencyRef = useRef(null);

    const maxAmount = incomes.length? Math.max(...incomes.map((income) => income.amount)) : 0;

    console.log(maxAmount);

    const filteredIncomes = incomes?.filter((income) =>
    {
       const matchSearch = income.title.toLowerCase().includes(inputSearch.toLowerCase());

       if(selectedFilter && selectedFilter.type === 'amount'){
            return(
                matchSearch &&
                income.amount >= selectedFilter.min &&
                income.amount <= selectedFilter.max
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
            if (editIncomeId) {
                payload.incomeId = editIncomeId;
                const data = await updateIncome(payload);
                setIncomes((prevIncomes) => prevIncomes.map((income) => income._id === editIncomeId ? { ...income, ...payload } : income));
                toast.success(data.message);
                resetFields();
                setEditIncomeId(null);
                return;
            }
            const data = await createIncome(payload);
            toast.success(data.message);
            resetFields();
            setIncomes((prevIncomes) => [...prevIncomes, data.income]);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsPending(false);
        }

    }

    const handleDeleteIncome = async (id) => {
        if (editIncomeId === id) {
            return;
        }
        try {
            setIsPending(true);
            const data = await deleteIncome(id, user.id);
            toast.success(data.message);
            setIncomes((prevIncomes) => prevIncomes.filter((income) => income._id !== id));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsPending(false);
        }
    }

    const handleEditIncome = (income) => {
        setEditIncomeId(income._id);
        titleRef.current.value = income.title;
        descriptionRef.current.value = income.description;
        amountRef.current.value = income.amount;
        tagRef.current.value = income.tag;
        currencyRef.current.value = income.currency;
    }

    useEffect(() => {
        const fetchData = async () => {
            const data = await getIncomes(user.id);
            setIncomes(data);
        };

        fetchData();
    }, [])

    return (
        <main className='expense-container'>
            <h1>Incomes</h1>
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
                        <option value="salary">Salary</option>
                        <option value="bonus">Bonus</option>
                        <option value="gift">Gift</option>
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
                    {editIncomeId ? 'Update Income' : 'Add Income'}
                </button>
            </form>
            <Filters 
            inputSearch={inputSearch} 
            setInputSearch={setInputSearch}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            maxAmount={maxAmount}
            />
            {filteredIncomes.length ? (
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
                        {filteredIncomes.map((income) => (
                            <tr key={income._id}>
                                <td>{income.title}</td>
                                <td>{income.description}</td>
                                <td>{income.amount}{CURRENCY_SYMBOLS[income.currency]}</td>
                                <td>{income.tag}</td>
                                <td>
                                    <div className='action-buttons'>
                                        <button className='edit-button' onClick={() => handleEditIncome(income)}>Edit</button>
                                        <button className='delete-button' onClick={() => handleDeleteIncome(income._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>) : inputSearch ?(
                    <p className='not-found'>"{inputSearch}" not found</p>
                ) : (
                    <p className='not-found'>No incomes found</p>
                )}
        </main>


    )
}