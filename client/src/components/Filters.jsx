import React, { useEffect, useState } from 'react'
import '../styles/Filters.css'
import { ListFilter, Trash2 } from 'lucide-react'
import { FilterModal } from './FilterModal'

export const Filters = ({ inputSearch, setInputSearch, selectedFilter, setSelectedFilter, maxAmount }) => {
    const MIN_BOUND = 0;
    const MAX_BOUND = maxAmount;

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [rangeValue, setRangeValue] = useState([MIN_BOUND, MAX_BOUND]);

    useEffect(() => {
        setRangeValue([MIN_BOUND, MAX_BOUND]);
    }, [maxAmount]);

    const handleFilterSelect = (option) => {
        setSelectedFilter(option);
        setIsFilterModalOpen(false);
    }

    const handleClearFilter = () => {
        setSelectedFilter(null);
        setRangeValue([MIN_BOUND, MAX_BOUND]);
    }

    return (
        <>
            <div className='filters'>
                <input type='text' placeholder='Search...' value={inputSearch} onChange={({ target }) => setInputSearch(target.value)} />
                <button onClick={() => setIsFilterModalOpen(true)}>
                    <ListFilter />
                </button>
            </div>

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onFilterSelect={handleFilterSelect}
                rangeValue={rangeValue}
                setRangeValue={setRangeValue}
                MIN_BOUND={MIN_BOUND}
                MAX_BOUND={MAX_BOUND}
            />
            {selectedFilter && (
                <div className='selected-filter'>
                    <span className='filter-label'>
                        Filter: Min: {selectedFilter.min} - Max: {selectedFilter.max}
                    </span>
                    <Trash2 onClick={handleClearFilter} className='clear-filter-icon'/>
                </div>
            )}
        </>
    )
}
