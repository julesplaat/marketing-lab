import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { loadData, saveData, getEmptyState } from '../lib/storage';

const AppContext = createContext(null);

const A = {
  INIT: 'INIT', SET_DATA: 'SET_DATA',
  ADD_EXP: 'ADD_EXP', UPDATE_EXP: 'UPDATE_EXP', DELETE_EXP: 'DELETE_EXP',
  ADD_LEARN: 'ADD_LEARN', UPDATE_LEARN: 'UPDATE_LEARN', DELETE_LEARN: 'DELETE_LEARN',
  ADD_COMP: 'ADD_COMP', UPDATE_COMP: 'UPDATE_COMP', DELETE_COMP: 'DELETE_COMP',
  ADD_CONTENT: 'ADD_CONTENT', UPDATE_CONTENT: 'UPDATE_CONTENT', DELETE_CONTENT: 'DELETE_CONTENT',
  UPDATE_META: 'UPDATE_META', UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

function reducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case A.INIT: case A.SET_DATA: return payload;
    case A.ADD_EXP: return { ...state, experiments: [...state.experiments, payload] };
    case A.UPDATE_EXP: return { ...state, experiments: state.experiments.map((e) => e.id === payload.id ? { ...e, ...payload, updatedAt: new Date().toISOString() } : e) };
    case A.DELETE_EXP: return { ...state, experiments: state.experiments.filter((e) => e.id !== payload), learnings: state.learnings.filter((l) => l.experimentId !== payload) };
    case A.ADD_LEARN: return { ...state, learnings: [...state.learnings, payload] };
    case A.UPDATE_LEARN: return { ...state, learnings: state.learnings.map((l) => l.id === payload.id ? { ...l, ...payload } : l) };
    case A.DELETE_LEARN: return { ...state, learnings: state.learnings.filter((l) => l.id !== payload) };
    case A.ADD_COMP: return { ...state, competitors: [...(state.competitors || []), payload] };
    case A.UPDATE_COMP: return { ...state, competitors: (state.competitors || []).map((c) => c.id === payload.id ? { ...c, ...payload } : c) };
    case A.DELETE_COMP: return { ...state, competitors: (state.competitors || []).filter((c) => c.id !== payload) };
    case A.ADD_CONTENT: return { ...state, contentPlan: [...(state.contentPlan || []), payload] };
    case A.UPDATE_CONTENT: return { ...state, contentPlan: (state.contentPlan || []).map((c) => c.id === payload.id ? { ...c, ...payload } : c) };
    case A.DELETE_CONTENT: return { ...state, contentPlan: (state.contentPlan || []).filter((c) => c.id !== payload) };
    case A.UPDATE_META: return { ...state, appMeta: { ...state.appMeta, ...payload } };
    case A.UPDATE_SETTINGS: return { ...state, settings: { ...state.settings, ...payload } };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null);

  useEffect(() => {
    let data = loadData();
    if (!data) {
      data = getEmptyState();
      saveData(data);
    }
    // Ensure new fields exist
    if (!data.competitors) data.competitors = [];
    if (!data.contentPlan) data.contentPlan = [];
    if (!data.settings) data.settings = {};
    if (!data.settings.customOptions) data.settings.customOptions = { cta: [], creativeType: [], channel: [], testType: [], buyerRole: [], problemTag: [] };
    dispatch({ type: A.INIT, payload: data });
  }, []);

  useEffect(() => { if (state) saveData(state); }, [state]);

  const actions = {
    addExperiment: useCallback((p) => dispatch({ type: A.ADD_EXP, payload: p }), []),
    updateExperiment: useCallback((p) => dispatch({ type: A.UPDATE_EXP, payload: p }), []),
    deleteExperiment: useCallback((p) => dispatch({ type: A.DELETE_EXP, payload: p }), []),
    addLearning: useCallback((p) => dispatch({ type: A.ADD_LEARN, payload: p }), []),
    updateLearning: useCallback((p) => dispatch({ type: A.UPDATE_LEARN, payload: p }), []),
    deleteLearning: useCallback((p) => dispatch({ type: A.DELETE_LEARN, payload: p }), []),
    addCompetitor: useCallback((p) => dispatch({ type: A.ADD_COMP, payload: p }), []),
    updateCompetitor: useCallback((p) => dispatch({ type: A.UPDATE_COMP, payload: p }), []),
    deleteCompetitor: useCallback((p) => dispatch({ type: A.DELETE_COMP, payload: p }), []),
    addContent: useCallback((p) => dispatch({ type: A.ADD_CONTENT, payload: p }), []),
    updateContent: useCallback((p) => dispatch({ type: A.UPDATE_CONTENT, payload: p }), []),
    deleteContent: useCallback((p) => dispatch({ type: A.DELETE_CONTENT, payload: p }), []),
    setData: useCallback((p) => dispatch({ type: A.SET_DATA, payload: p }), []),
    updateMeta: useCallback((p) => dispatch({ type: A.UPDATE_META, payload: p }), []),
    updateSettings: useCallback((p) => dispatch({ type: A.UPDATE_SETTINGS, payload: p }), []),
  };

  if (!state) return null;
  return <AppContext.Provider value={{ state, ...actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
