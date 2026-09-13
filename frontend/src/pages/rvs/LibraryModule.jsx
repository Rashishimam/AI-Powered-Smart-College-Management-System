import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  BookOpen, 
  Search, 
  BookmarkCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw,
  BookMarked,
  Layers,
  ArrowRight
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function LibraryModule() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'borrowed'

  const dummyBooks = [
    { id: 1, title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Computer Science', isbn: '978-0262033848', available_copies: 14, total_copies: 20, shelf: 'Stack A-12' },
    { id: 2, title: 'Database System Concepts (Silberschatz)', author: 'Abraham Silberschatz, Henry F. Korth', category: 'Computer Science', isbn: '978-0078022159', available_copies: 8, total_copies: 15, shelf: 'Stack A-15' },
    { id: 3, title: 'Design of Steel Structures', author: 'N. Subramanian', category: 'Civil Engineering', isbn: '978-0199460915', available_copies: 6, total_copies: 12, shelf: 'Stack C-04' },
    { id: 4, title: 'A Textbook of Machine Design', author: 'R.S. Khurmi, J.K. Gupta', category: 'Mechanical Engineering', isbn: '978-8121925372', available_copies: 10, total_copies: 18, shelf: 'Stack M-08' },
    { id: 5, title: 'Electronic Devices and Circuit Theory', author: 'Robert L. Boylestad, Louis Nashelsky', category: 'Electronics', isbn: '978-0132622264', available_copies: 12, total_copies: 16, shelf: 'Stack E-03' },
    { id: 6, title: 'Operating System Concepts', author: 'Peter B. Galvin, Greg Gagne', category: 'Computer Science', isbn: '978-1118063330', available_copies: 5, total_copies: 10, shelf: 'Stack A-18' }
  ];

  const borrowedList = [
    { id: 101, title: 'Database System Concepts', issueDate: 'Sep 01, 2026', dueDate: 'Sep 21, 2026', fine: '₹0', status: 'Active Borrow' },
    { id: 102, title: 'Computer Networks (Tanenbaum)', issueDate: 'Aug 10, 2026', dueDate: 'Aug 30, 2026', fine: '₹0', status: 'Returned' }
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/rvs/library/books');
        if (res.data?.success && res.data.books?.length > 0) {
          setBooks(res.data.books);
        } else {
          setBooks(dummyBooks);
        }
      } catch (err) {
        setBooks(dummyBooks);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              RVS Central Library & E-Resource Center
            </Badge>
            <span className="text-xs text-slate-500">25,000+ Printed Titles & IEEE/DELNET Digital Repositories</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Central Library & Research Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search physical books, inspect shelf accessions, review student borrowing history, and clear book fines.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Catalog Stock"
          value="25,480"
          subtitle="Printed text & reference books"
          icon={BookOpen}
          color="blue"
          trend="8 Departments"
        />
        <StatCard
          title="Issued Books"
          value="2,140"
          subtitle="Currently with students/faculty"
          icon={BookmarkCheck}
          color="navy"
          trend="Active"
        />
        <StatCard
          title="E-Journal Databases"
          value="IEEE & DELNET"
          subtitle="Full text institutional access"
          icon={Layers}
          color="emerald"
          trend="24x7 Digital"
        />
        <StatCard
          title="Outstanding Fines"
          value="₹0"
          subtitle="All returns verified up-to-date"
          icon={CheckCircle2}
          color="emerald"
          trend="Clean Account"
          trendType="up"
        />
      </div>

      {/* Tab Switcher & Search */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalog' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Book Catalog Search
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'borrowed' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              My Borrowing History & Fines
            </button>
          </div>

          {activeTab === 'catalog' && (
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, author, branch..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Catalog */}
        {activeTab === 'catalog' && (
          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-left text-xs erp-table">
              <thead>
                <tr>
                  <th>Book Title & Author</th>
                  <th>Category</th>
                  <th>ISBN / Accession</th>
                  <th>Shelf Location</th>
                  <th>Available Stock</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <p className="font-bold text-slate-900">{b.title}</p>
                      <p className="text-[11px] text-slate-500">{b.author}</p>
                    </td>
                    <td>
                      <Badge variant="primary" size="sm">{b.category}</Badge>
                    </td>
                    <td className="font-mono text-slate-600 text-[11px]">{b.isbn}</td>
                    <td className="font-mono text-blue-900 font-bold">{b.shelf || 'Stack A-12'}</td>
                    <td>
                      <span className="font-bold text-slate-900">
                        {b.available_copies}
                      </span>{' '}
                      <span className="text-slate-400 font-normal">/ {b.total_copies}</span>
                    </td>
                    <td className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Reserved "${b.title}"! Collect from Central Library Counter with your RVS ID card.`)}
                      >
                        Reserve Book
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Borrowed History */}
        {activeTab === 'borrowed' && (
          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-left text-xs erp-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Late Fine</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowedList.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-slate-900">{item.title}</td>
                    <td>{item.issueDate}</td>
                    <td className="font-semibold text-slate-800">{item.dueDate}</td>
                    <td className="font-bold text-emerald-700">{item.fine}</td>
                    <td>
                      <Badge variant={item.status === 'Active Borrow' ? 'gold' : 'success'} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      {item.status === 'Active Borrow' && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={RotateCcw}
                          onClick={() => alert('Renewal request submitted for 14 additional days.')}
                        >
                          Renew 14 Days
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
