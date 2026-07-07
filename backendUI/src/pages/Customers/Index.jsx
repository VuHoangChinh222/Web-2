import React, { useState } from 'react';
import { Search, UserPlus, ShoppingBag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import CustomerFormModal from './CustomerFormModal';
import RelatedOrdersModal from './RelatedOrdersModal';
import CustomerGridCard from './CustomerGridCard';
import customerService from '../../services/customerService';
import userAddressService from '../../services/userAddressService';
import orderService from '../../services/orderService';

const Customers = () => {
  const { 
    customers, 
    setCustomers,
    orders, 
    setOrders,
    uploadImage, 
    resolveImageUrl, 
    userAddresses,
    setUserAddresses
  } = useAdmin();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Related orders modal state
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);
  const [selectedCustomerForDelete, setSelectedCustomerForDelete] = useState(null);

  // Map customers locally
  const mappedCustomers = (customers || []).map(cust => {
    if (!cust) return null;
    const active = cust.status === 1;

    // Find default address from userAddresses state
    const defaultAddr = (userAddresses || []).find(addr => 
      (addr.customerId === cust.id || addr.customer?.id === cust.id) && addr.isDefault
    ) || (userAddresses || []).find(addr => 
      (addr.customerId === cust.id || addr.customer?.id === cust.id)
    );

    const addressText = defaultAddr ? 
      [defaultAddr.addressLine, defaultAddr.ward, defaultAddr.district, defaultAddr.city]
        .filter(part => part && part !== 'N/A')
        .join(', ') 
      : '';

    return {
      id: cust.id,
      fullname: cust.fullName || cust.fullname || cust.username || cust.email || 'Unknown',
      username: cust.username || cust.email || '',
      email: cust.email,
      phone: cust.phone || '',
      address: addressText,
      avatar: cust.imageUrl || cust.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      active: active,
      status: cust.status
    };
  }).filter(Boolean);

  // Filter and enrich customers
  const enrichedCustomers = mappedCustomers.map(cust => {
    const custOrders = (orders || []).filter(o => o.customerId === cust.id || o.customer?.id === cust.id);
    const spending = custOrders
      .filter(o => o.orderStatus === 'Completed' || o.orderStatus === '2')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return {
      ...cust,
      orderCount: custOrders.length,
      totalSpending: spending
    };
  });

  const filteredCustomers = enrichedCustomers.filter(cust =>
    cust.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.phone.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    setCurrentCustomer(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setCurrentCustomer(customer);
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Submit Operations
  const handleFormSubmit = async (formData) => {
    const body = {
      username: formData.username,
      fullName: formData.fullname,
      email: formData.email,
      phone: formData.phone || '',
      imageUrl: formData.avatar || formData.imageUrl || '',
      status: formData.active ? 1 : 0
    };
    if (formData.password && formData.password.trim() !== '') {
      body.password = formData.password;
    }

    let customerId = formData.id;

    try {
      if (modalType === 'add') {
        const newCustomer = await customerService.create(body);
        setCustomers(prev => [...prev, newCustomer]);
        customerId = newCustomer.id;
      } else {
        const updatedCustomer = await customerService.update(formData.id, body);
        setCustomers(prev => prev.map(c => c.id === formData.id ? updatedCustomer : c));
      }

      // Save or update address
      if (customerId) {
        const addressText = (formData.address || '').trim();
        const existingAddr = (userAddresses || []).find(addr => 
          (addr.customerId === customerId || addr.customer?.id === customerId) && addr.isDefault
        ) || (userAddresses || []).find(addr => 
          (addr.customerId === customerId || addr.customer?.id === customerId)
        );

        if (addressText) {
          const addressBody = {
            customerId: customerId,
            recipientName: formData.fullname || body.fullName || 'Recipient',
            recipientPhone: formData.phone || body.phone || '0912345678',
            addressLine: addressText,
            ward: existingAddr?.ward || 'N/A',
            district: existingAddr?.district || 'N/A',
            city: existingAddr?.city || 'N/A',
            isDefault: true
          };

          if (existingAddr) {
            const updatedAddr = await userAddressService.update(existingAddr.id, addressBody);
            setUserAddresses(prev => prev.map(a => a.id === existingAddr.id ? updatedAddr : a));
          } else {
            const newAddr = await userAddressService.create(addressBody);
            setUserAddresses(prev => [...prev, newAddr]);
          }
        }
      }
    } catch (err) {
      alert("Lỗi thao tác khách hàng: " + err.message);
    }

    setIsModalOpen(false);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await orderService.delete(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert("Lỗi khi xóa đơn hàng: " + err.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await customerService.delete(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      return true;
    } catch (err) {
      alert("Lỗi khi xóa khách hàng: " + err.message);
      return false;
    }
  };

  const handleDelete = async (id) => {
    const customer = mappedCustomers.find(c => c.id === id);
    if (!customer) return;

    const hasOrders = orders.some(o => o.customerId === id || o.customer?.id === id);
    if (hasOrders) {
      setSelectedCustomerForDelete(customer);
      setRelatedModalOpen(true);
      return;
    }
    if (confirm(`Are you sure you want to delete customer record "${customer.fullname}"?`)) {
      await handleDeleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Customers Directory</h2>
          <p className="text-xs text-slate-400">Total customers: {mappedCustomers.length} subscribers</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <UserPlus size={16} /> Add Customer
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="relative flex-1 min-w-[200px] md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs glass-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
            <ShoppingBag size={24} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold">No customers matched.</p>
          </div>
        ) : (
          filteredCustomers.map(cust => (
            <CustomerGridCard
              key={cust.id}
              cust={cust}
              resolveImageUrl={resolveImageUrl}
              handleOpenEdit={handleOpenEdit}
              handleDelete={handleDelete}
            />
          ))
        )}
      </div>

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        customerData={currentCustomer}
        resolveImageUrl={resolveImageUrl}
        uploadImage={uploadImage}
        onSubmit={handleFormSubmit}
      />

      <RelatedOrdersModal
        isOpen={relatedModalOpen}
        onClose={() => {
          setRelatedModalOpen(false);
          setSelectedCustomerForDelete(null);
        }}
        selectedCustomer={selectedCustomerForDelete}
        orders={orders}
        deleteOrder={handleDeleteOrder}
        deleteCustomer={handleDeleteCustomer}
      />
    </div>
  );
};

export default Customers;
