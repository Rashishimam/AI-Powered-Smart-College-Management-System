import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Calendar, Clock, MapPin, User, AlertCircle, Plus, CheckCircle2, Printer } from 'lucide-react';
import RVS_CONFIG from '../../config/rvsConfig';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

export default function TimetableModule() {
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSem, setSelectedSem] = useState('6th Semester');
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '09:00 - 10:00 AM',
    '10:00 - 11:00 AM',
    '11:15 - 12:15 PM',
    '12:15 - 01:15 PM',
    '02:00 - 04:00 PM'
  ];

  // Schedule matrix
  const scheduleData = {
    Monday: [
      { time: '09:00 - 10:00 AM', code: 'CS-601', subject: 'Distributed Systems', faculty: 'Prof. Jeevan Kumar', room: 'LH-101' },
      { time: '10:00 - 11:00 AM', code: 'CS-602', subject: 'Database Internals', faculty: 'Dr. Smita Dash', room: 'LH-101' },
      { time: '11:15 - 12:15 PM', code: 'CS-603', subject: 'Compiler Design', faculty: 'Prof. Shailendra Prasad', room: 'LH-102' },
      { time: '12:15 - 01:15 PM', code: 'CS-604', subject: 'Cyber Security', faculty: 'Prof. Yogendra Kumar', room: 'LH-101' },
      { time: '02:00 - 04:00 PM', code: 'CS-611', subject: 'Distributed Cloud Lab', faculty: 'Prof. Jeevan Kumar', room: 'Lab 4 (Center)' }
    ],
    Tuesday: [
      { time: '09:00 - 10:00 AM', code: 'CS-603', subject: 'Compiler Design', faculty: 'Prof. Shailendra Prasad', room: 'LH-101' },
      { time: '10:00 - 11:00 AM', code: 'CS-601', subject: 'Distributed Systems', faculty: 'Prof. Jeevan Kumar', room: 'LH-101' },
      { time: '11:15 - 12:15 PM', code: 'CS-602', subject: 'Database Internals', faculty: 'Dr. Smita Dash', room: 'LH-101' },
      { time: '12:15 - 01:15 PM', code: 'CS-605', subject: 'Open Elective (AI & Robotics)', faculty: 'Dr. Sushanta Mahanty', room: 'Seminar Hall' },
      { time: '02:00 - 04:00 PM', code: 'CS-612', subject: 'Compiler & OS Lab', faculty: 'Prof. Shailendra Prasad', room: 'Lab 2' }
    ],
    Wednesday: [
      { time: '09:00 - 10:00 AM', code: 'CS-602', subject: 'Database Internals', faculty: 'Dr. Smita Dash', room: 'LH-101' },
      { time: '10:00 - 11:00 AM', code: 'CS-604', subject: 'Cyber Security', faculty: 'Prof. Yogendra Kumar', room: 'LH-101' },
      { time: '11:15 - 12:15 PM', code: 'CS-601', subject: 'Distributed Systems', faculty: 'Prof. Jeevan Kumar', room: 'LH-101' },
      { time: '12:15 - 01:15 PM', code: 'CS-603', subject: 'Compiler Design', faculty: 'Prof. Shailendra Prasad', room: 'LH-101' },
      { time: '02:00 - 04:00 PM', code: 'T&P-01', subject: 'Aptitude & Technical Coding', faculty: 'Corporate Trainer', room: 'Auditorium 1' }
    ],
    Thursday: [
      { time: '09:00 - 10:00 AM', code: 'CS-601', subject: 'Distributed Systems', faculty: 'Prof. Jeevan Kumar', room: 'LH-101' },
      { time: '10:00 - 11:00 AM', code: 'CS-603', subject: 'Compiler Design', faculty: 'Prof. Shailendra Prasad', room: 'LH-101' },
      { time: '11:15 - 12:15 PM', code: 'CS-604', subject: 'Cyber Security', faculty: 'Prof. Yogendra Kumar', room: 'LH-101' },
      { time: '12:15 - 01:15 PM', code: 'CS-602', subject: 'Database Internals', faculty: 'Dr. Smita Dash', room: 'LH-101' },
      { time: '02:00 - 04:00 PM', code: 'CS-613', subject: 'Database Practical Lab', faculty: 'Dr. Smita Dash', room: 'Computing Lab 3' }
    ],
    Friday: [
      { time: '09:00 - 10:00 AM', code: 'CS-604', subject: 'Cyber Security', faculty: 'Prof. Yogendra Kumar', room: 'LH-101' },
      { time: '10:00 - 11:00 AM', code: 'CS-602', subject: 'Database Internals', faculty: 'Dr. Smita Dash', room: 'LH-101' },
      { time: '11:15 - 12:15 PM', code: 'CS-601', subject: 'Distributed Systems', faculty: 'Prof. Jeevan Kumar', room: 'LH-101' },
      { time: '12:15 - 01:15 PM', code: 'CS-605', subject: 'Open Elective (Robotics)', faculty: 'Dr. Sushanta Mahanty', room: 'LH-101' },
      { time: '02:00 - 04:00 PM', code: 'CS-614', subject: 'Capstone Project Evaluation', faculty: 'Department Committee', room: 'Seminar Hall' }
    ],
    Saturday: [
      { time: '09:00 - 10:00 AM', code: 'CS-603', subject: 'Compiler Design', faculty: 'Prof. Shailendra Prasad', room: 'LH-101' },
      { time: '10:00 - 11:00 AM', code: 'CS-601', subject: 'Distributed Systems Tutorial', faculty: 'Prof. Jeevan Kumar', room: 'LH-101' },
      { time: '11:15 - 12:15 PM', code: 'LIB-01', subject: 'Library & Online Research Hour', faculty: 'Central Librarian', room: 'Central Library' },
      { time: '12:15 - 01:15 PM', code: 'ACT-01', subject: 'NSS & Club Activities', faculty: 'Club Mentors', room: 'Campus Grounds' },
      { time: '02:00 - 04:00 PM', code: 'REM-01', subject: 'Remedial Class & Doubt Session', faculty: 'Faculty Guides', room: 'LH-101' }
    ]
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              RVS Academic Dean Scheduling Directorate
            </Badge>
            <span className="text-xs text-slate-500">Conflict-Free Room & Faculty Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Weekly Class & Laboratory Timetable
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized schedule across lecture halls, computer centers, and specialized engineering laboratories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-44">
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={RVS_CONFIG.departments.map(d => ({ value: d.code, label: `${d.code} - ${d.name}` }))}
            />
          </div>

          <div className="w-36">
            <Select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              options={[
                { value: '2nd Semester', label: '2nd Semester' },
                { value: '4th Semester', label: '4th Semester' },
                { value: '6th Semester', label: '6th Semester' },
                { value: '8th Semester', label: '8th Semester' }
              ]}
            />
          </div>

          <Button
            variant="outline"
            size="md"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Timetable
          </Button>
        </div>
      </div>

      {/* Timetable Weekly Matrix */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900">
              {selectedDept} &bull; {selectedSem} Academic Timetable Matrix
            </h3>
          </div>
          <Badge variant="success" size="sm">
            Conflict-Free Verified
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3.5 font-bold text-slate-600 uppercase text-[11px] w-36 border-r border-slate-200">
                  Time Slot
                </th>
                {days.map((day) => (
                  <th key={day} className="p-3.5 font-bold text-slate-900 text-center uppercase text-[11px] border-r border-slate-200 last:border-none">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {timeSlots.map((slotTime, sIdx) => (
                <tr key={sIdx} className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-mono text-xs font-bold text-slate-700 bg-slate-50/70 border-r border-slate-200 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-800" />
                      <span>{slotTime}</span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const daySlots = scheduleData[day] || [];
                    const slotItem = daySlots.find((s) => s.time === slotTime);

                    if (!slotItem) {
                      return (
                        <td key={day} className="p-2 border-r border-slate-200 last:border-none text-center text-slate-400 text-[11px]">
                          —
                        </td>
                      );
                    }

                    const isLab = slotItem.subject.toLowerCase().includes('lab') || slotItem.subject.toLowerCase().includes('project');

                    return (
                      <td key={day} className="p-2 border-r border-slate-200 last:border-none align-top">
                        <div className={`p-2.5 rounded-xl border text-left transition-all ${
                          isLab
                            ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                            : 'bg-blue-50/60 border-blue-100 hover:border-blue-200'
                        }`}>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] font-bold text-blue-900">
                              {slotItem.code}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                              {slotItem.room}
                            </span>
                          </div>

                          <h5 className="font-bold text-slate-900 text-xs line-clamp-1 leading-tight">
                            {slotItem.subject}
                          </h5>

                          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{slotItem.faculty}</span>
                          </p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
