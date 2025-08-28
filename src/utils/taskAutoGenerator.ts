export interface AutoTask {
  id: string;
  productionCode: string;
  taskType: 'downtime' | 'pdi' | 'maintenance' | 'quality';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdFrom: 'production' | 'manual';
  rejectionReason?: string;
  quantity?: number;
  issueType?: string;
}

export const generateTaskFromProduction = (
  productionCode: string,
  rejectionReason: string,
  rejectedQty: number,
  issueType: string,
  date: string
): AutoTask[] => {
  const tasks: AutoTask[] = [];
  const taskId = `task_${Date.now()}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 2); // Default 2 days due date

  // Generate tasks based on issue type selected in production entry
  switch (issueType) {
    case 'machine-breakdown':
      tasks.push({
        id: `${taskId}_breakdown`,
        productionCode,
        taskType: 'downtime',
        title: `Machine Breakdown Resolution - ${productionCode}`,
        description: `Urgent: Resolve machine breakdown issue: ${rejectionReason}. Production affected: ${rejectedQty} units.`,
        priority: rejectedQty > 50 ? 'high' : 'medium',
        assignedTo: 'Maintenance Team',
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        createdFrom: 'production',
        rejectionReason,
        quantity: rejectedQty,
        issueType
      });
      break;

    case 'material-shortage':
      tasks.push({
        id: `${taskId}_material`,
        productionCode,
        taskType: 'quality',
        title: `Material Shortage Resolution - ${productionCode}`,
        description: `Resolve material shortage: ${rejectionReason}. Production impact: ${rejectedQty} units.`,
        priority: rejectedQty > 100 ? 'high' : 'medium',
        assignedTo: 'Production Team',
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        createdFrom: 'production',
        rejectionReason,
        quantity: rejectedQty,
        issueType
      });
      break;

    case 'quality-issue':
      tasks.push({
        id: `${taskId}_quality`,
        productionCode,
        taskType: 'pdi',
        title: `Quality Issue Analysis - ${productionCode}`,
        description: `Investigate quality defects: ${rejectionReason}. Rejected quantity: ${rejectedQty} units.`,
        priority: rejectedQty > 30 ? 'high' : 'medium',
        assignedTo: 'Quality Team',
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        createdFrom: 'production',
        rejectionReason,
        quantity: rejectedQty,
        issueType
      });
      break;

    case 'maintenance':
      tasks.push({
        id: `${taskId}_maintenance`,
        productionCode,
        taskType: 'maintenance',
        title: `Planned Maintenance Task - ${productionCode}`,
        description: `Complete planned maintenance: ${rejectionReason}. Production scheduling: ${rejectedQty} units affected.`,
        priority: 'medium',
        assignedTo: 'Maintenance Team',
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        createdFrom: 'production',
        rejectionReason,
        quantity: rejectedQty,
        issueType
      });
      break;

    case 'changeover':
      tasks.push({
        id: `${taskId}_changeover`,
        productionCode,
        taskType: 'quality',
        title: `Changeover Process Optimization - ${productionCode}`,
        description: `Optimize changeover process: ${rejectionReason}. Time impact affecting ${rejectedQty} units.`,
        priority: 'low',
        assignedTo: 'Production Team',
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        createdFrom: 'production',
        rejectionReason,
        quantity: rejectedQty,
        issueType
      });
      break;

    case 'power-failure':
      tasks.push({
        id: `${taskId}_power`,
        productionCode,
        taskType: 'downtime',
        title: `Power System Issue - ${productionCode}`,
        description: `Address power failure: ${rejectionReason}. Production loss: ${rejectedQty} units.`,
        priority: rejectedQty > 75 ? 'high' : 'medium',
        assignedTo: 'Facilities Team',
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        createdFrom: 'production',
        rejectionReason,
        quantity: rejectedQty,
        issueType
      });
      break;

    default:
      tasks.push({
        id: `${taskId}_general`,
        productionCode,
        taskType: 'quality',
        title: `Production Issue Resolution - ${productionCode}`,
        description: `Investigate and resolve: ${rejectionReason}. Affected quantity: ${rejectedQty} units.`,
        priority: rejectedQty > 25 ? 'medium' : 'low',
        assignedTo: 'Production Supervisor',
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        createdFrom: 'production',
        rejectionReason,
        quantity: rejectedQty,
        issueType
      });
  }

  return tasks;
};

export const generateTaskFromRejection = (
  productionCode: string,
  rejectionReason: string,
  rejectedQty: number,
  date: string
): AutoTask[] => {
  const tasks: AutoTask[] = [];
  const taskId = `task_${Date.now()}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 2);

  // Determine task type and details based on rejection reason
  if (rejectionReason.toLowerCase().includes('machine') || 
      rejectionReason.toLowerCase().includes('breakdown') ||
      rejectionReason.toLowerCase().includes('malfunction')) {
    
    tasks.push({
      id: `${taskId}_downtime`,
      productionCode,
      taskType: 'downtime',
      title: `Machine Issue Investigation - ${productionCode}`,
      description: `Investigate and resolve machine-related rejection: ${rejectionReason}. Rejected quantity: ${rejectedQty} units.`,
      priority: rejectedQty > 50 ? 'high' : 'medium',
      assignedTo: 'Maintenance Team',
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending',
      createdFrom: 'production',
      rejectionReason,
      quantity: rejectedQty
    });

  } else if (rejectionReason.toLowerCase().includes('quality') || 
             rejectionReason.toLowerCase().includes('defect') ||
             rejectionReason.toLowerCase().includes('flash') ||
             rejectionReason.toLowerCase().includes('sink')) {
    
    tasks.push({
      id: `${taskId}_pdi`,
      productionCode,
      taskType: 'pdi',
      title: `Quality Defect Analysis - ${productionCode}`,
      description: `Analyze quality defects and implement corrective measures: ${rejectionReason}. Rejected quantity: ${rejectedQty} units.`,
      priority: rejectedQty > 30 ? 'high' : 'medium',
      assignedTo: 'Quality Team',
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending',
      createdFrom: 'production',
      rejectionReason,
      quantity: rejectedQty
    });

  } else if (rejectionReason.toLowerCase().includes('material') ||
             rejectionReason.toLowerCase().includes('process')) {
    
    tasks.push({
      id: `${taskId}_quality`,
      productionCode,
      taskType: 'quality',
      title: `Process/Material Review - ${productionCode}`,
      description: `Review process parameters and material quality: ${rejectionReason}. Rejected quantity: ${rejectedQty} units.`,
      priority: rejectedQty > 40 ? 'high' : 'medium',
      assignedTo: 'Process Engineer',
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending',
      createdFrom: 'production',
      rejectionReason,
      quantity: rejectedQty
    });

  } else {
    tasks.push({
      id: `${taskId}_general`,
      productionCode,
      taskType: 'quality',
      title: `Production Issue Resolution - ${productionCode}`,
      description: `Investigate and resolve production issue: ${rejectionReason}. Rejected quantity: ${rejectedQty} units.`,
      priority: rejectedQty > 25 ? 'medium' : 'low',
      assignedTo: 'Production Supervisor',
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending',
      createdFrom: 'production',
      rejectionReason,
      quantity: rejectedQty
    });
  }

  return tasks;
};

export const createDowntimeEntry = (
  productionCode: string,
  rejectionReason: string,
  rejectedQty: number
) => {
  // This would integrate with the Downtime component
  return {
    productionCode,
    issueType: getIssueTypeFromReason(rejectionReason),
    duration: estimateDurationFromRejection(rejectedQty),
    status: 'Open',
    autoGenerated: true,
    description: `Auto-generated from production rejection: ${rejectionReason}`,
    correctiveActions: [
      {
        action: `Investigate root cause of ${rejectionReason.toLowerCase()}`,
        responsible: 'Production Team',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ],
    preventiveActions: [
      {
        action: 'Implement preventive measures to avoid recurrence',
        responsible: 'Process Engineer',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]
  };
};

const getIssueTypeFromReason = (reason: string): string => {
  if (reason.toLowerCase().includes('machine') || reason.toLowerCase().includes('breakdown')) {
    return 'Machine Breakdown';
  } else if (reason.toLowerCase().includes('material')) {
    return 'Material Quality Issue';
  } else if (reason.toLowerCase().includes('quality') || reason.toLowerCase().includes('defect')) {
    return 'Quality Issue';
  } else if (reason.toLowerCase().includes('process')) {
    return 'Process Parameter Deviation';
  }
  return 'Other';
};

const estimateDurationFromRejection = (rejectedQty: number): number => {
  // Estimate downtime based on rejected quantity
  if (rejectedQty > 100) return 120; // 2 hours for high rejection
  if (rejectedQty > 50) return 60;   // 1 hour for medium rejection
  if (rejectedQty > 20) return 30;   // 30 minutes for low rejection
  return 15; // 15 minutes for minimal rejection
};
