import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Subscription, Folder } from '../types';
import { sampleData } from '../data/sampleData';

interface SubscriptionState {
  subscriptions: Subscription[];
  folders: Folder[];
  sortOption: string | null;
  sortOrder: 'asc' | 'desc';
}

type SubscriptionAction =
  | { type: 'SET_SUBSCRIPTIONS'; payload: Subscription[] }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'TOGGLE_ARCHIVE'; payload: string }
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'UPDATE_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'SET_SORT'; payload: { option: string | null; order: 'asc' | 'desc' } }
  | { type: 'LOAD_DATA'; payload: SubscriptionState };

const initialState: SubscriptionState = {
  subscriptions: [],
  folders: [],
  sortOption: null,
  sortOrder: 'asc'
};

const SubscriptionContext = createContext<{
  state: SubscriptionState;
  dispatch: React.Dispatch<SubscriptionAction>;
} | null>(null);

function subscriptionReducer(state: SubscriptionState, action: SubscriptionAction): SubscriptionState {
  switch (action.type) {
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload };
    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [...state.subscriptions, action.payload] };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(sub =>
          sub.id === action.payload.id ? action.payload : sub
        )
      };
    case 'DELETE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.filter(sub => sub.id !== action.payload)
      };
    case 'TOGGLE_ARCHIVE':
      return {
        ...state,
        subscriptions: state.subscriptions.map(sub =>
          sub.id === action.payload ? { ...sub, archived: !sub.archived } : sub
        )
      };
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    case 'ADD_FOLDER':
      return { ...state, folders: [...state.folders, action.payload] };
    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map(folder =>
          folder.id === action.payload.id ? action.payload : folder
        )
      };
    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(folder => folder.id !== action.payload),
        subscriptions: state.subscriptions.filter(sub => sub.folderId !== action.payload)
      };
    case 'SET_SORT':
      return { ...state, sortOption: action.payload.option, sortOrder: action.payload.order };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('subscriptionData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Failed to load saved data:', error);
        dispatch({ type: 'LOAD_DATA', payload: sampleData });
      }
    } else {
      dispatch({ type: 'LOAD_DATA', payload: sampleData });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('subscriptionData', JSON.stringify(state));
  }, [state]);

  return (
    <SubscriptionContext.Provider value={{ state, dispatch }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}