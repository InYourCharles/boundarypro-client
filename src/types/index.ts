import type { z } from 'zod';
import type { driverSchema } from '../schemas/driver.schema';
import type { vehicleSchema } from '../schemas/vehicle.schema';
import type { assignmentSchema, completeSchema } from '../schemas/assignment.schema';
import type { paymentSchema } from '../schemas/payment.schema';
import type { maintenanceSchema, completeServiceSchema } from '../schemas/maintenance.schema';
import type { reportFilterSchema } from '../schemas/reportFilter.schema';

// ---- What the forms hold. z.infer reads the type from the Zod schema, so the schema is the only place to change.
export type DriverFormValues = z.infer<typeof driverSchema>;
export type VehicleFormValues = z.infer<typeof vehicleSchema>;
export type AssignmentFormValues = z.infer<typeof assignmentSchema>;
export type CompleteFormValues = z.infer<typeof completeSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;
export type CompleteServiceFormValues = z.infer<typeof completeServiceSchema>;
export type ReportFilterValues = z.infer<typeof reportFilterSchema>;

// ---- What the API sends back. Dates arrive as ISO text; money is whole pesos.
export type DriverStatus = 'active' | 'suspended' | 'inactive';
export type VehicleType = 'tricycle' | 'jeepney';
export type VehicleStatus = 'available' | 'under-maintenance' | 'retired';
export type Shift = 'morning' | 'afternoon' | 'night';
export type AssignmentStatus = 'scheduled' | 'active' | 'completed' | 'no-show' | 'cancelled';
export type PaymentMethod = 'cash' | 'gcash' | 'bank-transfer';
export type ServiceType = 'oil-change' | 'tires' | 'brakes' | 'engine' | 'electrical' | 'general-service' | 'other';
export type ServiceStatus = 'in-progress' | 'completed';

export interface Driver {
  _id: string;
  fullName: string;
  licenseNumber: string;
  contactNumber: string;
  address?: string;
  status: DriverStatus;
  dateHired: string;
}

// The drivers list adds the two computed amounts that feed the balance badge
export interface DriverWithBalance extends Driver {
  balance: number;
  overdueAmount: number;
}

export interface Vehicle {
  _id: string;
  plateNumber: string;
  type: VehicleType;
  model?: string;
  boundaryRate: number;
  odometerKm: number;
  serviceIntervalKm: number;
  serviceIntervalDays: number;
  lastServiceDate?: string;
  lastServiceOdometerKm: number;
  status: VehicleStatus;
}

export interface Assignment {
  _id: string;
  driver: { _id: string; fullName: string };
  vehicle: { _id: string; plateNumber: string; type: VehicleType };
  date: string;
  shift: Shift;
  status: AssignmentStatus;
  boundaryDue: number;
  penaltyFee: number;
  startOdometerKm?: number;
  endOdometerKm?: number;
  notes?: string;
}

export interface Payment {
  _id: string;
  driver: { _id: string; fullName: string };
  amountPaid: number;
  method: PaymentMethod;
  paidAt: string;
  referenceNo?: string;
  remarks?: string;
}

export interface MaintenanceRecord {
  _id: string;
  vehicle: { _id: string; plateNumber: string; type: VehicleType; model?: string };
  type: ServiceType;
  description?: string;
  cost: number;
  status: ServiceStatus;
  serviceDate: string;
  odometerKm: number;
  nextDueDate?: string;
  nextDueOdometerKm?: number;
}

// ---- The processing endpoints. These dates are already Manila days ("2026-10-12").
export interface Charge {
  assignmentId: string;
  date: string;
  shift: Shift;
  type: 'boundary' | 'no-show penalty';
  amount: number;
  paid: number;
  outstanding: number;
  dueDate: string;
  overdue: boolean;
}

export interface BalanceReport {
  driverId: string;
  fullName: string;
  asOf: string;
  totalCharged: number;
  totalPaid: number;
  balance: number;
  overdueAmount: number;
  overdueCount: number;
  charges: Charge[];
}

export interface RankedDriver {
  rank: number;
  driverId: string;
  fullName: string;
  score: number;
  onTimeRate: number;
  attendanceRate: number;
  clearanceRate: number;
  outstanding: number;
}

export interface UnrankedDriver {
  driverId: string;
  fullName: string;
  reason: string;
}

export interface Ranking {
  asOf: string;
  ranked: RankedDriver[];
  unranked: UnrankedDriver[];
}

export interface Reason {
  code: string;
  message: string;
}

export interface Availability {
  available: boolean;
  reasons: Reason[];
  warnings: Reason[];
}

export interface DueVehicle {
  _id: string;
  plateNumber: string;
  inShop: boolean;
  severity: 'overdue' | 'due-soon';
  kmSinceService: number | null;
  daysSinceService: number | null;
  percentUsed: number | null;
  reasons: string[];
}

export interface MaintenanceDue {
  asOf: string;
  count: number;
  vehicles: DueVehicle[];
}

export interface VehicleEarning {
  _id: string;
  plateNumber: string;
  revenue: number;
}

export interface CollectionStats {
  range: { from: string; to: string; groupBy: 'day' | 'month' };
  expected: number;
  collected: number;
  collectionRate: number;
  maintenanceCost: number;
  netCash: number;
  overdueTotal: number;
  topVehicle: VehicleEarning | null;
  lowestVehicle: VehicleEarning | null;
  idleVehicles: { _id: string; plateNumber: string }[];
  series: { period: string; expected: number; collected: number }[];
}
