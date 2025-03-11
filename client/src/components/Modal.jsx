import React from 'react'
import '../styles/Modal.css'

export const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return;

    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <button className='modal-close' onClick={onClose}>X</button>
                {children}
            </div>
        </div>
    )
}
