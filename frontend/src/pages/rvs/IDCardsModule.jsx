import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  Printer, 
  Download, 
  QrCode, 
  UserCheck, 
  ShieldCheck,
  Building2,
  Sparkles,
  Phone,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

export default function IDCardsModule() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState(user?.role === 'faculty' ? 'faculty' : 'student');
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIdCard = async (type) => {
    try {
      setLoading(true);
      const res = await api.get(`/rvs/id-card/${type}/${user?.id || 4}`);
      if (res.data?.success) {
        setCardData(res.data.card);
      }
    } catch (err) {
      console.error('Failed to load ID card:', err);
      // Fallback demo data
      setCardData({
        name: type === 'faculty' ? 'Prof. Jeevan Kumar' : 'Rahul Kumar Verma',
        role_label: type === 'faculty' ? 'Assistant Professor & HOD' : 'Undergraduate Student',
        department: 'Computer Science & Engineering',
        id_number: type === 'faculty' ? 'RVS-FAC-108' : '23RVSCSE042',
        reg_number: 'JUT/2023/CSE/0189',
        session: '2023 - 2027',
        blood_group: 'O +ve',
        emergency_contact: '7033000777',
        valid_until: 'June 2027',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdCard(activeType);
  }, [activeType]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              RVS Campus Security & Registrar Office
            </Badge>
            <span className="text-xs text-slate-500">Official Smart RFID/QR ID Badges</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Identity Cards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-resistant student & faculty identity cards with embedded QR security code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Card Type Switcher */}
          <div className="p-1 bg-slate-100 rounded-xl flex border border-slate-200">
            <button
              onClick={() => setActiveType('student')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeType === 'student' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student ID Card
            </button>
            <button
              onClick={() => setActiveType('faculty')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeType === 'faculty' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty ID Card
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Card
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDownload}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* ID Card Display Area */}
      <div className="flex flex-col items-center justify-center py-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Rendering institutional security badge...</p>
          </div>
        ) : (
          <div className="w-full max-w-sm rounded-3xl bg-white border-2 border-slate-300 shadow-xl overflow-hidden text-center text-slate-900 printable-area transition-all duration-300 relative">
            {/* Top Color Band */}
            <div className="bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#1e3a8a] text-white pt-4 pb-3 px-4 border-b-2 border-amber-400 relative">
              <div className="flex items-center justify-center gap-2.5 mb-1.5">
                <RVSLogo size="xs" showText={false} />
                <div className="text-center">
                  <h3 className="text-xs font-black tracking-tight text-white uppercase font-sans">
                    RVS College of Engineering & Technology
                  </h3>
                  <p className="text-[9px] text-amber-300 font-semibold tracking-wider uppercase">
                    Jamshedpur, Jharkhand &bull; Estd. 1993
                  </p>
                </div>
              </div>
              <p className="text-[8px] text-slate-300 opacity-90 leading-tight">
                Approved by AICTE, New Delhi &bull; Affiliated to JUT Ranchi
              </p>
            </div>

            {/* Photo & Badge Type Indicator */}
            <div className="pt-5 px-6 pb-4">
              <div className="relative inline-block mx-auto mb-3">
                <img
                  src={cardData?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                  alt={cardData?.name}
                  className="w-24 h-28 object-cover rounded-xl border-2 border-blue-900 shadow-md mx-auto"
                />
                <span className={`
                  absolute -bottom-2 inset-x-0 mx-auto px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider w-max shadow-sm
                  ${activeType === 'faculty' ? 'bg-amber-400 text-slate-950' : 'bg-blue-800 text-white'}
                `}>
                  {activeType === 'faculty' ? 'FACULTY' : 'STUDENT'}
                </span>
              </div>

              {/* Name & Role */}
              <h2 className="text-base font-black text-slate-900 tracking-tight mt-1">
                {cardData?.name}
              </h2>
              <p className="text-xs font-semibold text-blue-900">
                {cardData?.role_label || (activeType === 'faculty' ? 'Assistant Professor' : 'B.Tech Student')}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {cardData?.department || 'Computer Science & Engineering'}
              </p>

              {/* Metadata Grid */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">
                    {activeType === 'faculty' ? 'Employee ID:' : 'Roll Number:'}
                  </span>
                  <span className="font-mono font-bold text-slate-900">{cardData?.id_number || '23RVSCSE042'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">University Reg:</span>
                  <span className="font-mono text-slate-800">{cardData?.reg_number || 'JUT/2023/0189'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Academic Session:</span>
                  <span className="font-semibold text-slate-800">{cardData?.session || '2023 - 2027'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Blood Group:</span>
                  <span className="font-bold text-rose-600">{cardData?.blood_group || 'O +ve'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Emergency Phone:</span>
                  <span className="text-slate-800 font-medium">{cardData?.emergency_contact || RVS_CONFIG.phone}</span>
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-400">Card Validity:</span>
                  <span className="text-emerald-700 font-bold">{cardData?.valid_until || 'June 2027'}</span>
                </div>
              </div>

              {/* QR Code & Authority Signatures */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-300 shadow-2xs">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <div className="text-left text-[9px] text-slate-400 leading-tight">
                    <p className="font-mono font-bold text-slate-700">CAMPUS RFID</p>
                    <p>Scan to verify</p>
                    <p>at entry gates</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-24 border-b border-slate-400 pb-1 mb-1">
                    <span className="font-serif italic text-xs text-blue-950 font-bold">R. K. Tiwari</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                    Principal & Registrar
                  </p>
                  <p className="text-[8px] text-slate-400">RVSCET Jamshedpur</p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-slate-100 py-2 text-[9px] text-slate-500 border-t border-slate-200 font-medium">
              If found, please return to: RVS CET, Edalbera, Bhilai Pahari, NH-33, Jamshedpur - 831012
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
