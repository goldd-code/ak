import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Subscription } from '../../types';
import { getNextOccurrence } from '../../utils/dateUtils';

interface RenewalCalendarProps {
  renewalData: Array<{
    date: string;
    count: number;
    amount: number;
    subscriptions: string[];
  }>;
  subscriptions: Subscription[];
}

export default function RenewalCalendar({ renewalData, subscriptions }: RenewalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: {
      date: string;
      totalAmount: number;
      subscriptions: Array<{ name: string; amount: number }>;
    };
  }>({ visible: false, x: 0, y: 0, content: { date: '', totalAmount: 0, subscriptions: [] } });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      
      // Find renewals for this day
      const dayRenewals = subscriptions.filter(sub => {
        const nextDue = getNextOccurrence(sub.dueDate, sub.repeat);
        return nextDue.toDateString() === currentDay.toDateString() && 
               currentDay.getMonth() === month;
      });
      
      const totalAmount = dayRenewals.reduce((sum, sub) => sum + sub.amount, 0);
      
      days.push({
        date: new Date(currentDay),
        dateStr,
        day: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString(),
        renewals: dayRenewals,
        count: dayRenewals.length,
        amount: totalAmount
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  }, [currentDate, subscriptions]);

  const maxRenewals = Math.max(...calendarData.map(day => day.count), 1);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return '';
    const intensity = Math.ceil((count / maxRenewals) * 4);
    return `intensity-${intensity}`;
  };

  const handleMouseEnter = (day: any, event: React.MouseEvent) => {
    if (day.count > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (containerRect) {
        setTooltip({
          visible: true,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 10,
          content: {
            date: day.date.toLocaleDateString(),
            totalAmount: day.amount,
            subscriptions: day.renewals.map((sub: Subscription) => ({
              name: sub.name,
              amount: sub.amount
            }))
          }
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="renewal-calendar" ref={containerRef}>
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn" 
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft size={16} />
        </button>
        <h4 className="calendar-title">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <button 
          className="calendar-nav-btn" 
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        
        <div className="calendar-days">
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                day.isToday ? 'today' : ''
              } ${getIntensityClass(day.count)}`}
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseLeave={handleMouseLeave}
            >
              <span className="day-number">{day.day}</span>
              {day.count > 0 && (
                <div className="renewal-indicator">
                  <span className="renewal-count">{day.count}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {tooltip.visible && (
        <div 
          className="calendar-tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)',
            pointerEvents: 'none'
          }}
        >
          <h4>{tooltip.content.date}</h4>
          <div className="total-amount">
            Total: ${tooltip.content.totalAmount.toFixed(2)}
          </div>
          {tooltip.content.subscriptions.map((sub, index) => (
            <div key={index} className="subscription-item">
              <span className="subscription-name">{sub.name}</span>
              <span className="subscription-amount">${sub.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="calendar-legend">
        <span className="legend-label">Less</span>
        <div className="legend-items">
          {[0, 1, 2, 3, 4].map(intensity => (
            <div
              key={intensity}
              className={`legend-item ${intensity > 0 ? `intensity-${intensity}` : ''}`}
            />
          ))}
        </div>
        <span className="legend-label">More</span>
      </div>
    </div>
  );
}