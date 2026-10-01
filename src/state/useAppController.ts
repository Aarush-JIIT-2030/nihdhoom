import { useState } from 'react';
import { ActiveTab } from '../components/Header';
import { INITIAL_FIELDS, INITIAL_MACHINES, MOCK_FIRMS_FIRE_EVENTS } from '../data/mockData';
import { Field, Machine, BurnEvent, LatLng } from '../types';

const DEMO_MODE = import.meta.env.VITE_NIRDHOOM_DEMO_MODE === 'true';

export function useAppController() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('OVERVIEW');
  const [fields, setFields] = useState<Field[]>(DEMO_MODE ? INITIAL_FIELDS : []);
  const [machines] = useState<Machine[]>(DEMO_MODE ? INITIAL_MACHINES : []);
  const [fireEvents] = useState<BurnEvent[]>(DEMO_MODE ? MOCK_FIRMS_FIRE_EVENTS : []);
  const [selectedField, setSelectedField] = useState<Field | null>(DEMO_MODE ? INITIAL_FIELDS[0] : null);
  const [activeRoutePolyline, setActiveRoutePolyline] = useState<LatLng[]>([]);
  const [isPitchDrawerOpen, setIsPitchDrawerOpen] = useState(false);
  const [certificateField, setCertificateField] = useState<Field | null>(null);
  const [fieldForUpiModal, setFieldForUpiModal] = useState<Field | null>(null);

  const handleUpdateFieldStatus = (
    fieldId: string,
    newStatus: Field['status'],
    payoutAmt?: number,
  ) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              status: newStatus,
              payout_amount: payoutAmt ?? field.payout_amount,
              is_verified_non_burn:
                newStatus === 'CLEARED_PENDING_AUDIT' ||
                newStatus === 'VERIFIED_NON_BURN',
            }
          : field,
      ),
    );
  };

  return {
    demoMode: DEMO_MODE,
    activeTab,
    setActiveTab,
    fields,
    machines,
    fireEvents,
    selectedField,
    setSelectedField,
    activeRoutePolyline,
    setActiveRoutePolyline,
    isPitchDrawerOpen,
    setIsPitchDrawerOpen,
    certificateField,
    setCertificateField,
    fieldForUpiModal,
    setFieldForUpiModal,
    handleUpdateFieldStatus,
  };
}
