import { useState } from 'react';
import { ActiveTab } from '../components/Header';
import { INITIAL_FIELDS, INITIAL_MACHINES, MOCK_FIRMS_FIRE_EVENTS } from '../data/mockData';
import { Field, Machine, BurnEvent, LatLng } from '../types';

export function useAppController() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('OVERVIEW');
  const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
  const [machines] = useState<Machine[]>(INITIAL_MACHINES);
  const [fireEvents] = useState<BurnEvent[]>(MOCK_FIRMS_FIRE_EVENTS);
  const [selectedField, setSelectedField] = useState<Field | null>(INITIAL_FIELDS[0]);
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
