import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Ticket, FilterState, TicketStatus, TicketPriority } from '@/types/ticket';

interface TicketStore {
  // State
  tickets: Ticket[];
  selectedTicketId: string | null;
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  
  // Ticket statuses and priorities
  ticketStatuses: TicketStatus[];
  ticketPriorities: TicketPriority[];
  
  // Actions
  setTickets: (tickets: Ticket[]) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  setSelectedTicket: (id: string | null) => void;
  
  // Filter actions
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  applyFilter: (filter: Partial<FilterState>) => Ticket[];
  
  // Status and priority actions
  setTicketStatuses: (statuses: TicketStatus[]) => void;
  setTicketPriorities: (priorities: TicketPriority[]) => void;
  
  // Loading and error actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility actions
  clearError: () => void;
  refreshTickets: () => Promise<void>;
}

const defaultFilters: FilterState = {
  status: [],
  priority: [],
  assignee: [],
  dateRange: null,
  tags: [],
  customFields: {},
  search: '',
};

export const useTicketStore = create<TicketStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        tickets: [],
        selectedTicketId: null,
        filters: defaultFilters,
        isLoading: false,
        error: null,
        ticketStatuses: [],
        ticketPriorities: [],
        
        // Ticket actions
        setTickets: (tickets) => set({ tickets }),
        
        addTicket: (ticket) => set((state) => ({
          tickets: [ticket, ...state.tickets],
        })),
        
        updateTicket: (id, updates) => set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === id ? { ...ticket, ...updates } : ticket
          ),
        })),
        
        deleteTicket: (id) => set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id),
          selectedTicketId: state.selectedTicketId === id ? null : state.selectedTicketId,
        })),
        
        setSelectedTicket: (id) => set({ selectedTicketId: id }),
        
        // Filter actions
        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
        
        resetFilters: () => set({ filters: defaultFilters }),
        
        applyFilter: (filter) => {
          const state = get();
          const newFilters = { ...state.filters, ...filter };
          return state.tickets.filter((ticket) => {
            // Status filter
            if (newFilters.status.length > 0 && !newFilters.status.includes(ticket.status.id)) {
              return false;
            }
            
            // Priority filter
            if (newFilters.priority.length > 0 && !newFilters.priority.includes(ticket.priority.id)) {
              return false;
            }
            
            // Assignee filter
            if (newFilters.assignee.length > 0 && (!ticket.assigneeId || !newFilters.assignee.includes(ticket.assigneeId))) {
              return false;
            }
            
            // Date range filter
            if (newFilters.dateRange) {
              const ticketDate = new Date(ticket.createdAt);
              if (ticketDate < newFilters.dateRange[0] || ticketDate > newFilters.dateRange[1]) {
                return false;
              }
            }
            
            // Tags filter
            if (newFilters.tags.length > 0 && !newFilters.tags.some((tag) => ticket.tags.includes(tag))) {
              return false;
            }
            
            // Search filter
            if (newFilters.search) {
              const searchLower = newFilters.search.toLowerCase();
              return (
                ticket.subject.toLowerCase().includes(searchLower) ||
                ticket.description?.toLowerCase().includes(searchLower) ||
                false
              );
            }
            
            return true;
          });
        },
        
        // Status and priority actions
        setTicketStatuses: (statuses) => set({ ticketStatuses: statuses }),
        setTicketPriorities: (priorities) => set({ ticketPriorities: priorities }),
        
        // Loading and error actions
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        
        // Utility actions
        clearError: () => set({ error: null }),
        
        refreshTickets: async () => {
          const { setLoading, setError, setTickets } = get();
          setLoading(true);
          setError(null);
          
          try {
            const response = await fetch('/api/tickets');
            if (!response.ok) {
              throw new Error('Failed to fetch tickets');
            }
            const tickets = await response.json();
            setTickets(tickets);
          } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
          } finally {
            setLoading(false);
          }
        },
      }),
      {
        name: 'ticket-store',
        partialize: (state) => ({
          filters: state.filters,
          selectedTicketId: state.selectedTicketId,
        }),
      }
    ),
    { name: 'ticket-store' }
  )
);

// Selectors
export const useTickets = () => useTicketStore((state) => state.tickets);
export const useSelectedTicket = () => useTicketStore((state) => 
  state.tickets.find((ticket) => ticket.id === state.selectedTicketId)
);
export const useTicketFilters = () => useTicketStore((state) => state.filters);
export const useFilteredTickets = () => {
  const tickets = useTickets();
  const filters = useTicketFilters();
  const applyFilter = useTicketStore((state) => state.applyFilter);
  
  return applyFilter(filters);
};
export const useTicketLoading = () => useTicketStore((state) => state.isLoading);
export const useTicketError = () => useTicketStore((state) => state.error);
export const useTicketStatuses = () => useTicketStore((state) => state.ticketStatuses);
export const useTicketPriorities = () => useTicketStore((state) => state.ticketPriorities);
