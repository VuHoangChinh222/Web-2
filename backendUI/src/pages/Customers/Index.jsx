import React, { useState } from 'react';
import { Search, UserPlus, ShoppingBag, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import CustomerFormModal from './CustomerFormModal';
import RelatedOrdersModal from './RelatedOrdersModal';
import CustomerGridCard from './CustomerGridCard';
import CustomerListItem from './CustomerListItem';
import CustomerAddressModal from './CustomerAddressModal';
import CustomerViewModal from './CustomerViewModal';
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
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null);

  // Related orders modal state
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);
  const [selectedCustomerForDelete, setSelectedCustomerForDelete] = useState(null);

  // Customer address management modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedCustomerForAddress, setSelectedCustomerForAddress] = useState(null);

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 6 : 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewMode]);

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) {
        end = 5;
      } else if (end === totalPages) {
        start = totalPages - 4;
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const handleManageAddresses = (customer) => {
    setSelectedCustomerForAddress(customer);
    setAddressModalOpen(true);
  };

  const handleAddressChanged = async () => {
    try {
      const allAddresses = await userAddressService.getAll();
      const addrList = Array.isArray(allAddresses.data) ? allAddresses.data : (Array.isArray(allAddresses) ? allAddresses : []);
      setUserAddresses(addrList);
    } catch (e) {
      console.error("Lỗi đồng bộ danh sách địa chỉ:", e);
    }
  };

  const handleToggleStatus = async (customer) => {
    // Tìm object khách hàng gốc trong context/state
    const rawCustomer = customers.find(c => c.id === customer.id);
    if (!rawCustomer) return;

    const nextStatus = rawCustomer.status === 1 ? 0 : 1;
    const body = {
      username: rawCustomer.username,
      fullName: rawCustomer.fullName || rawCustomer.fullname,
      email: rawCustomer.email,
      phone: rawCustomer.phone || '',
      imageUrl: rawCustomer.imageUrl || rawCustomer.avatar || '',
      status: nextStatus
    };

    try {
      const updated = await customerService.update(customer.id, body);
      setCustomers(prev => prev.map(c => c.id === customer.id ? updated : c));
    } catch (err) {
      alert("Lỗi cập nhật trạng thái khách hàng: " + err.message);
    }
  };

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

  const handleOpenView = (customer) => {
    setSelectedCustomerForView(customer);
    setViewModalOpen(true);
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
        const addressText = (formData.addressLine || formData.address || '').trim();
        const existingAddr = (userAddresses || []).find(addr =>
          (addr.customerId === customerId || addr.customer?.id === customerId) && addr.isDefault
        ) || (userAddresses || []).find(addr =>
          (addr.customerId === customerId || addr.customer?.id === customerId)
        );

        if (addressText || formData.city) {
          const addressBody = {
            customerId: customerId,
            recipientName: formData.fullname || body.fullName || 'Recipient',
            recipientPhone: formData.phone || body.phone || '0912345678',
            addressLine: addressText,
            ward: formData.ward || existingAddr?.ward || 'N/A',
            district: formData.district || existingAddr?.district || 'N/A',
            city: formData.city || existingAddr?.city || 'N/A',
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
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex bg-[#0F1224]/50 border border-white/10 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <List size={16} />
            </button>
          </div>
          <button
            onClick={handleOpenAdd}
            className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <UserPlus size={16} /> Add Customer
          </button>
        </div>
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

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
              <ShoppingBag size={24} className="text-slate-600 mb-2" />
              <p className="text-xs font-semibold">No customers matched.</p>
            </div>
          ) : (
            currentItems.map(cust => (
              <CustomerGridCard
                key={cust.id}
                cust={cust}
                resolveImageUrl={resolveImageUrl}
                handleOpenEdit={handleOpenEdit}
                handleOpenView={handleOpenView}
                handleDelete={handleDelete}
                handleManageAddresses={handleManageAddresses}
                handleToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F1224]/50 backdrop-blur-md">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="p-3 font-semibold w-14">Avatar</th>
                <th className="p-3 font-semibold w-44">Name & ID</th>
                <th className="p-3 font-semibold w-60">Contact</th>
                <th className="p-3 font-semibold">Address</th>
                <th className="p-3 font-semibold w-32">Orders & Spent</th>
                <th className="p-3 font-semibold w-24">Status</th>
                <th className="p-3 font-semibold text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <ShoppingBag size={24} className="mx-auto mb-2 opacity-50" />
                    No customers matched.
                  </td>
                </tr>
              ) : (
                currentItems.map(cust => (
                  <CustomerListItem
                    key={cust.id}
                    cust={cust}
                    resolveImageUrl={resolveImageUrl}
                    handleOpenEdit={handleOpenEdit}
                    handleOpenView={handleOpenView}
                    handleDelete={handleDelete}
                    handleManageAddresses={handleManageAddresses}
                    handleToggleStatus={handleToggleStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 mt-4">
          <p className="text-xs text-slate-400 order-2 sm:order-1">
            Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-semibold text-white">
              {Math.min(indexOfLastItem, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-white">{totalItems}</span> customers
          </p>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            {getVisiblePages().map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all duration-200 ${
                  currentPage === pageNumber
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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

      <CustomerAddressModal
        isOpen={addressModalOpen}
        onClose={() => {
          setAddressModalOpen(false);
          setSelectedCustomerForAddress(null);
        }}
        customer={selectedCustomerForAddress}
        onAddressChanged={handleAddressChanged}
      />

      <CustomerViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedCustomerForView(null);
        }}
        customer={selectedCustomerForView}
        userAddresses={userAddresses}
        orders={orders}
        resolveImageUrl={resolveImageUrl}
      />
    </div>
  );
};

export default Customers;
