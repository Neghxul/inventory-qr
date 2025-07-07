"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Company, Contact, User } from '@prisma/client';
import { FiX, FiPlusCircle, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { CompanyWithOwner } from '@/types/index';

// Tipos para el formulario
interface LineItem {
    code: string;
    description: string;
    quantity: number;
    unitCost: number;
    oc: string;
}
interface Props {
    isOpen: boolean;
    onClose: () => void;
    companies: CompanyWithOwner[];
    sellers: User[];
    companyId?: string;
    onOrderSaved: () => void;
}

export default function OrderFormModal({ isOpen, onClose, companies, companyId: defaultCompanyId, onOrderSaved }: Props) {
    const [selectedCompany, setSelectedCompany] = useState<CompanyWithOwner | null>(null);
    const [companySearch, setCompanySearch] = useState('');
    const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
    
    const [contactId, setContactId] = useState('');
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    
    const [rev, setRev] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [lineItems, setLineItems] = useState<LineItem[]>([{ code: '', description: '', quantity: 1, unitCost: 0, oc: '' }]);
    
    const [isLoading, setIsLoading] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const companyInputRef = useRef<HTMLInputElement>(null);

    // --- Efecto para inicializar la compañía si viene por defecto ---
    useEffect(() => {
        if (defaultCompanyId) {
            const company = companies.find(c => c.id === defaultCompanyId);
            if(company) {
                setSelectedCompany(company);
                setCompanySearch(company.name);
            }
        }
    }, [defaultCompanyId, companies]);

    // --- Efecto para cargar contactos cuando cambia la compañía ---
    useEffect(() => {
        if (selectedCompany) {
            const fetchContacts = async () => {
                const res = await fetch(`/api/crm/companies/${selectedCompany.id}/contacts`);
                if (res.ok) setFilteredContacts(await res.json());
                setContactId('');
            };
            fetchContacts();
        } else {
            setFilteredContacts([]);
        }
    }, [selectedCompany]);

    // --- Lógica para el autocompletar de compañías ---
    const companySuggestions = useMemo(() => {
        if (!companySearch || selectedCompany?.name === companySearch) return [];
        return companies.filter(c => 
            c.name.toLowerCase().includes(companySearch.toLowerCase())
        );
    }, [companySearch, companies, selectedCompany]);
    
    const handleSelectCompany = (company: CompanyWithOwner) => {
        setSelectedCompany(company);
        setCompanySearch(company.name);
        setShowCompanySuggestions(false);
    };

    // --- Lógica para cerrar el modal ---
    const handleClose = () => {
        // Resetear todos los estados
        onClose();
    };
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
            handleClose();
        }
    };
    
    // --- Lógica de Artículos y Cálculo de Totales ---
    const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const updatedItems = [...lineItems];
        
        // [CORRECCIÓN] Asegurarse de que los valores numéricos se guarden como números
        if (field === 'quantity' || field === 'unitCost') {
            const numericValue = Number(value);
            updatedItems[index] = { ...updatedItems[index], [field]: isNaN(numericValue) ? 0 : numericValue };
        } else {
            updatedItems[index] = { ...updatedItems[index], [field]: value };
        }
        setLineItems(updatedItems);
    };  
    const addLineItem = () => setLineItems([...lineItems, { code: '', description: '', quantity: 1, unitCost: 0, oc: '' }]);
    const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));

    // --- Agrupación y cálculo de totales por OC (Orden de Compra) ---
    const totalsByOC = useMemo(() => {
        const groups: { [key: string]: number } = {};
        lineItems.forEach(item => {
            const oc = item.oc || 'N/A';
            const lineTotal = item.quantity * item.unitCost;
            if (!groups[oc]) groups[oc] = 0;
            groups[oc] += lineTotal;
        });
        return groups;
    }, [lineItems]);

    const grandTotal = useMemo(() => {
        return Object.values(totalsByOC).reduce((sum, total) => sum + total, 0);
    }, [totalsByOC]);

    // --- Enviar el Formulario ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany || !contactId) {
            return toast.error("Company and Contact are required.");
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/crm/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: selectedCompany.id,
                    contactId,
                    rev,
                    invoiceNumber,
                    lineItems
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            toast.success("Order created successfully!");
            onOrderSaved();
            onClose();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div onClick={(e) => {if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) onClose();}} className="fixed inset-0 bg-black/60 flex justify-center items-start z-50 p-4 pt-16">
            <div ref={modalContentRef} className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Create New Order</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- Selección de Compañía y Contacto --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                ref={companyInputRef}
                                type="text"
                                placeholder="Search Company..."
                                value={companySearch}
                                onChange={(e) => {setCompanySearch(e.target.value); setSelectedCompany(null);}}
                                onFocus={() => setShowCompanySuggestions(true)}
                                onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                                className="w-full bg-gray-800 p-2 pl-10 rounded"
                                disabled={!!defaultCompanyId}
                            />
                            {showCompanySuggestions && companySuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-40 overflow-y-auto">
                                    {companySuggestions.map(c => <li key={c.id} onMouseDown={() => handleSelectCompany(c)} className="p-2 hover:bg-blue-600 cursor-pointer">{c.name}</li>)}
                                </ul>
                            )}
                            {/* Futuro botón para añadir compañía */}
                        </div>
                        <select value={contactId} onChange={(e) => setContactId(e.target.value)} required className="w-full bg-gray-800 p-2 rounded text-white" disabled={!selectedCompany}>
                            <option value="">Select Contact*</option>
                            {filteredContacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </div>

                    {/* --- Vendedor, REV, Factura --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 bg-gray-800 p-2 rounded h-10">
                                {selectedCompany?.owner ? (
                                    <>
                                        <FiUser className="text-blue-400"/>
                                        <span className="text-white">{selectedCompany.owner.name}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-500">Seller</span>
                                )}
                            </div>
                        </div>
                        <input type="text" placeholder="REV" value={rev} onChange={(e) => setRev(e.target.value)} className="w-full bg-gray-800 p-2 rounded"/>
                        <input type="text" placeholder="Invoice No." value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full bg-gray-800 p-2 rounded"/>
                    </div>
                    
                    {/* --- Artículos de la Orden --- */}
                    <div className="space-y-2 pt-4 border-t border-gray-700">
                        <h3 className="text-lg font-semibold text-white">Line Items</h3>
                        {lineItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <input type="text" placeholder="Code" value={item.code} onChange={e => handleLineItemChange(index, 'code', e.target.value)} className="col-span-2 bg-gray-800 p-1 rounded"/>
                                <input type="text" placeholder="Description" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="col-span-4 bg-gray-800 p-1 rounded"/>
                                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', Number(e.target.value))} className="col-span-1 bg-gray-800 p-1 rounded"/>
                                <input type="number" placeholder="Unit Cost" value={item.unitCost} onChange={e => handleLineItemChange(index, 'unitCost', Number(e.target.value))} className="col-span-2 bg-gray-800 p-1 rounded"/>
                                <input type="text" placeholder="OC" value={item.oc} onChange={e => handleLineItemChange(index, 'oc', e.target.value)} className="col-span-2 bg-gray-800 p-1 rounded"/>
                                <button type="button" onClick={() => removeLineItem(index)} className="col-span-1 text-red-500 hover:text-red-400 flex justify-center"><FiTrash2/></button>
                            </div>
                        ))}
                         <button type="button" onClick={addLineItem} className="flex items-center gap-2 text-sm text-blue-400 hover:underline"><FiPlusCircle/> Add Item</button>
                    </div>

                    {/* --- Totales --- */}
                     <div className="pt-4 border-t border-gray-700 text-right">
                        {Object.entries(totalsByOC).map(([oc, total]) => (
                            <p key={oc} className="text-gray-400">Total for OC {oc}: <span className="font-semibold text-white">${total.toFixed(2)}</span></p>
                        ))}
                        <h3 className="text-xl font-bold text-white mt-2">Grand Total: ${grandTotal.toFixed(2)}</h3>
                    </div>

                    {/* --- Botones de Acción --- */}
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={handleClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">{isLoading ? 'Saving...' : 'Save Order'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}