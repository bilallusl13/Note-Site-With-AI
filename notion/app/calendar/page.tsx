"use client"
import React, { useCallback, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';
import './calendar.css';
import toast from 'react-hot-toast';
import { Dialog } from "@mui/material";

interface Event {
  id: string;
  title: string;
  date: string;
  color?: string;
  description?: string;
}

export default function MyCalendar() {
  const [events, setEvents] = useState<Event[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', color: '#3b82f6' });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.startStr);
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    setEventToDelete(clickInfo.event.id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    await deleteEvent(eventToDelete);
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Geçersiz veya eksik token bilgisi");
        return;
      }

      const response = await fetch("/api/events/deletevent", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: eventId })
      });

      const contentType = response.headers.get("content-type");
      let errorMsg = "Bilinmeyen hata";
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } else {
          errorMsg = await response.text();
        }
        toast.error("Silme işlemi başarısız: " + errorMsg);
        return;
      }

      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast.success("Etkinlik silindi ve çöp kutusuna taşındı");
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error("Silme işlemi başarısız");
    }
  };

const addEvent = useCallback(async () => {
  if (newEvent.title.trim()) {
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      color: newEvent.color,
      description: newEvent.description,
    };

    // State güncellemesini fonksiyonel olarak yap (daha güvenli)
    setEvents(prevEvents => [...prevEvents, event]);
    setNewEvent({ title: '', description: '', color: '#3b82f6' });
    setShowEventModal(false);

    // API'ye kaydet
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Token yok veya geçersiz");
      return;
    }

    try {
      const response = await fetch("/api/events/saveevent", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({   title: newEvent.title,
    description: newEvent.description,
    color: newEvent.color,
    Finaldate: selectedDate, }),
      });

      if (!response.ok) {
        toast.error("Sunucu ile bağlantı kurulamadı");
        return;
      }

      toast.success("Etkinlik kaydedildi");
    } catch (error: any) {
      toast.error(`Hata: ${error.message || error}`);
    }
  }
// useCallback bağımlılıklarından events çıkarıldı
}, [newEvent, selectedDate]);

 useEffect(() => {
  async function getEventInfo() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Geçersiz veya eksik token bilgisi");
        return;
      }
      const response = await fetch("/api/events/allevents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Dikkat: "Bearer" ile token arasında boşluk var ama başında boşluk olmamalı
        }
      });
      if (!response.ok) {
        toast.error("Sunucu ile iletişim kurulamadı");
        return;
      }
      const data = await response.json();  // Veriyi burada alabilirsin
     
      setEvents(data.response);
    } catch (error: any) {
      toast.error(`${error.message || error}`);
    }
  }

  getEventInfo();  // Fonksiyon çağrısı unutulmuş
}, []);


console.log(events)

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>📅 Takvim</h1>
        <p>Etkinliklerinizi planlayın ve organize edin</p>
      </div>

      <div className="calendar-wrapper">
        
      <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={trLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={true}
          moreLinkClick="popover"
          eventDisplay="block"
          eventColor="#3b82f6"
          eventTextColor="#ffffff"
        />
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Yeni Etkinlik Ekle</h3>
            <div className="form-group">
              <label>Başlık:</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Etkinlik başlığı"
              />
            </div>
            <div className="form-group">
              <label>Açıklama:</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Etkinlik açıklaması"
              />
            </div>
            <div className="form-group">
              <label>Renk:</label>
              <input
                type="color"
                value={newEvent.color}
                onChange={(e) => setNewEvent({...newEvent, color: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={addEvent} className="btn-primary">Ekle</button>
              <button onClick={() => setShowEventModal(false)} className="btn-secondary">İptal</button>
            </div>
          </div>
        </div>
      )}
      {/* Silme Onay Modali */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <div className="p-6">
          <h3>Etkinliği silmek istediğine emin misin?</h3>
          <div className="flex gap-4 mt-4">
            <button onClick={confirmDeleteEvent} className="btn-primary">Evet, Sil</button>
            <button onClick={() => setDeleteDialogOpen(false)} className="btn-secondary">İptal</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
