import { useEffect, useState, useRef } from "react"
import { warehouseFlowDSL, warehouseFlowData } from "./warehouseFlowDSL"
import FLOWUIRenderer2 from "./components/ui-rendere-2";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const WarehouseApp = () => {
    // Single state for the entire flow
    const [flowData, setFlowData] = useState<any>(warehouseFlowData);
    const [schema] = useState<any>(warehouseFlowDSL.warehouse_discrepancy_investigation_flow);
    
    // Preview mode specific states (removed unused previewFlowData and previewSchema)
    // UI components are now inline with messages

    // Mode state
    const [mode, setMode] = useState<'dev' | 'preview'>('preview');

    // Dev mode states
    const [devMessages, setDevMessages] = useState<Array<{ role: string, content: string }>>([])
    const [devInput, setDevInput] = useState('');
    const [devIsLoading, setDevIsLoading] = useState(false)

    // Preview mode states
    const [previewMessages, setPreviewMessages] = useState<Array<{ role: string, content: string, hasUI?: boolean, uiSchema?: any, uiData?: any }>>([])
    const [previewInput, setPreviewInput] = useState('');
    const [previewIsLoading, setPreviewIsLoading] = useState(false)

    const [promptHistory, setPromptHistory] = useState<string[]>([])
        const [historyIndex, setHistoryIndex] = useState(-1)
    
    // Refs for input fields
    const previewTextareaRef = useRef<HTMLTextAreaElement>(null)
    const devMessagesRef = useRef<HTMLDivElement>(null)
    
        // Local storage key for prompt history
        const PROMPT_HISTORY_KEY = 'prompt_history'
    
        // Load prompt history from localStorage on component mount
        useEffect(() => {
            const savedHistory = localStorage.getItem(PROMPT_HISTORY_KEY)
            if (savedHistory) {
                try {
                    const parsedHistory = JSON.parse(savedHistory)
                    if (Array.isArray(parsedHistory)) {
                        setPromptHistory(parsedHistory)
                    }
                } catch (error) {
                    console.error('Failed to parse prompt history from localStorage:', error)
                }
            }
        }, [])

        // Auto-scroll to bottom when new messages are added
        useEffect(() => {
            if (devMessagesRef.current) {
                devMessagesRef.current.scrollTo({
                    top: devMessagesRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, [devMessages, devIsLoading])

        // Save prompt to history and localStorage
        const savePromptToHistory = (prompt: string) => {
            if (!prompt.trim()) return
    
            setPromptHistory(prev => {
                // Remove duplicate if it exists and add to beginning
                const filtered = prev.filter(p => p !== prompt.trim())
                const newHistory = [prompt.trim(), ...filtered].slice(0, 50) // Keep only last 50 prompts
                
                // Save to localStorage
                localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(newHistory))
                
                return newHistory
            })
            
            // Reset history index
            setHistoryIndex(-1)
        }
    
        // Navigate through prompt history (mode-aware)
        const navigateHistory = (direction: 'up' | 'down') => {
            if (promptHistory.length === 0) return
    
            let newIndex: number
            
            if (direction === 'up') {
                newIndex = historyIndex + 1
                if (newIndex >= promptHistory.length) {
                    newIndex = promptHistory.length - 1
                }
            } else {
                newIndex = historyIndex - 1
                if (newIndex < -1) {
                    newIndex = -1
                }
            }
    
            setHistoryIndex(newIndex)
            
            // Update the appropriate input field based on current mode
            if (newIndex === -1) {
                if (mode === 'dev') {
                    setDevInput('')
                } else {
                    setPreviewInput('')
                }
            } else {
                if (mode === 'dev') {
                    setDevInput(promptHistory[newIndex])
                } else {
                    setPreviewInput(promptHistory[newIndex])
                }
            }
        }
    
    // Helper function to update the correct state based mode
    const updateFlowState = (updateFunction: (prev: any) => any) => {
        // Always update flowData since it's used for dev mode and as the base data
        setFlowData(updateFunction);

        // For preview mode, update ALL messages that have UI components
        if (mode === 'preview') {
            setPreviewMessages(prev => prev.map(msg => {
                if (msg.hasUI && msg.uiData) {
                    return {
                        ...msg,
                        uiData: updateFunction(msg.uiData)
                    };
                }
                return msg;
            }));
        }
    };

    // Helper function to set input and focus textarea
    const setInputAndFocus = (inputText: string) => {
        setPreviewInput(inputText);
        // Focus the textarea after state update
        setTimeout(() => {
            previewTextareaRef.current?.focus();
        }, 0);
    };

    const handlers = {
        // Navigation handlers
        navigate_to_alert: () => {
            console.log('🏠 Navigating to alert');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'alert',
                    breadcrumb: 'Home > Discrepancy Alert'
                }
            }));
        },

        navigate_to_transactions: () => {
            console.log('📋 Navigating to transactions - starting loading');

            // First navigate to transactions step with loading state
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    step: 'transactions',
                    breadcrumb: 'Home > Discrepancy Alert > Transactions'
                },
                loadingStates: {
                    ...prev.loadingStates,
                    transactions: true
                }
            }));

            console.log('Loading state set, will clear in 2 seconds');

            // Simulate database fetch delay
            setTimeout(() => {
                console.log('Clearing loading state');
                updateFlowState((prev: any) => ({
                    ...prev,
                    loadingStates: {
                        ...prev.loadingStates,
                        transactions: false
                    }
                }));
            }, 2000);
        },

        navigate_to_investigation: () => {
            console.log('🔍 Navigating to investigation - starting loading');

            // First navigate to investigation step with loading state
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    step: 'stock_investigation',
                    breadcrumb: 'Home > Discrepancy Alert > Investigation'
                },
                loadingStates: {
                    ...prev.loadingStates,
                    stockInvestigation: true
                }
            }));

            console.log('Stock investigation loading state set, will clear in 2.5 seconds');

            // Simulate database fetch delay
            setTimeout(() => {
                console.log('Clearing stock investigation loading state');
                updateFlowState((prev: any) => ({
                    ...prev,
                    loadingStates: {
                        ...prev.loadingStates,
                        stockInvestigation: false
                    }
                }));
            }, 2500);
        },

        navigate_to_stock_investigation: () => {
            console.log('🔍 Navigating to stock investigation');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'stock_investigation',
                    breadcrumb: 'Home > Discrepancy Alert > Investigation'
                }
            }));
        },

        navigate_to_recount: () => {
            console.log('📊 Navigating to recount');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'recount',
                    breadcrumb: 'Home > Discrepancy Alert > Physical Recount'
                }
            }));
        },

        navigate_to_worker_profile: () => {
            console.log('👤 Navigating to worker profile');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'worker_profile',
                    breadcrumb: 'Home > Discrepancy Alert > Transactions > Worker Profile'
                }
            }));
        },

        navigate_to_resolution: () => {
            console.log('✅ Navigating to resolution');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Discrepancy Alert > Resolution'
                }
            }));
        },

        // Action handlers
        escalate_to_supervisor: () => {
            console.log('🚨 Escalating to supervisor');

            // Show escalation confirmation
            alert(`🚨 ESCALATION INITIATED\n\n` +
                `📋 Discrepancy: ${warehouseFlowData.discrepancy.productName}\n` +
                `📍 Location: ${warehouseFlowData.discrepancy.zoneId}\n` +
                `⚡ Priority: HIGH\n\n` +
                `✅ Actions completed:\n` +
                `• Supervisor notification sent\n` +
                `• Escalation ticket created\n` +
                `• Investigation report prepared\n` +
                `• Case marked for immediate review\n\n` +
                `📞 Supervisor will be contacted within 15 minutes\n` +
                `📧 Email notification sent to management team\n` +
                `🔄 Case status updated to "Escalated"`);

            updateFlowState((prev: any) => ({
                ...prev,
                resolution: {
                    ...prev.resolution,
                    status: 'escalated',
                    message: 'Critical discrepancy escalated to supervisor for immediate review',
                    supervisor_notified: true,
                    investigation_conducted: false, // No investigation done for immediate escalation
                    actions_taken: [
                        'Discrepancy alert received',
                        'High severity detected',
                        'Case escalated to supervisor',
                        'Management team notified',
                        'Awaiting supervisor review'
                    ],
                    escalation_reason: 'High priority discrepancy requires immediate supervisor review',
                    escalated_at: new Date().toLocaleString()
                },
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Discrepancy Alert > Escalated to Supervisor'
                }
            }));
        },

        ignore_alert: () => {
            console.log('❌ Ignoring alert');
            updateFlowState((prev: any) => ({
                ...prev,
                resolution: {
                    ...prev.resolution,
                    status: 'resolved',
                    message: 'Alert dismissed by operator. No action required.',
                    supervisor_notified: false
                },
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Discrepancy Alert > Dismissed'
                }
            }));
        },

        submit_recount: () => {
            console.log('✅ Submitting recount');
            const input = document.querySelector('input[name="physicalCount"]') as HTMLInputElement;
            const count = input ? parseInt(input.value) : 0;
            
            if (count && count > 0) {
                const expectedQuantity = 12; // 20 - 10 + 2
                const variance = count - expectedQuantity;
                let varianceType = 'none';
                let edgeCase = 'resolved';
                let status = 'resolved';
                let message = '';
                let recommendations: string[] = [];
                
                if (variance > 0) {
                    varianceType = 'positive';
                    edgeCase = 'mis_entry';
                    status = 'requires_review';
                    message = `Physical count (${count}) is higher than expected (${expectedQuantity}). Potential scanning mis-entry detected.`;
                    recommendations = ['Generate Discrepancy Report', 'Trigger Supervisor Audit', 'Verify Scan Accuracy'];
                } else if (variance < 0) {
                    varianceType = 'negative';
                    edgeCase = 'continue_investigation';
                    status = 'needs_investigation';
                    message = `Physical count (${count}) is lower than expected (${expectedQuantity}). Continue investigation required.`;
                    recommendations = ['Generate Discrepancy Report', 'Trigger Supervisor Audit', 'Adjust System Stock'];
                } else {
                    message = `Physical count matches expected quantity (${expectedQuantity}). Discrepancy resolved.`;
                    recommendations = ['Generate Resolution Report', 'Close Investigation'];
                }
                
                updateFlowState((prev: any) => ({
                    ...prev,
                    recount: {
                        ...prev.recount,
                        result: {
                            ...prev.recount.result,
                            physicalCount: count,
                            variance,
                            varianceType,
                            edgeCase,
                            analysisComplete: true,
                            recommendations
                        }
                    },
                    resolution: {
                        ...prev.resolution,
                        status,
                        message,
                        investigation_conducted: true, // Recount investigation was completed
                        final_quantity: count,
                        actions_taken: [
                            'Physical recount conducted',
                            `Variance analysis completed (${variance > 0 ? '+' : ''}${variance})`,
                            'Edge case detection performed'
                        ]
                    },
                    currentFlow: {
                        ...prev.currentFlow,
                        step: 'recount_results',
                        breadcrumb: 'Home > Discrepancy Alert > Recount Results'
                    }
                }));
            } else {
                alert('Please enter a valid count');
            }
        },

        reset_count: () => {
            console.log('🔄 Resetting count');
            const input = document.querySelector('input[name="physicalCount"]') as HTMLInputElement;
            if (input) input.value = '';
        },

        // Investigation handlers
        investigate_transaction: () => {
            console.log('🔍 Investigating transaction');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'stock_investigation',
                    breadcrumb: 'Home > Discrepancy Alert > Transactions > Investigation'
                }
            }));
        },

        // Stock investigation sub-flow handlers
        view_scan_logs: () => {
            console.log('📊 Viewing scan logs');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'scan_logs',
                    breadcrumb: 'Home > Investigation > Scan Logs'
                }
            }));
        },


        // Navigation handlers for Step 3 sub-options
        navigate_to_pick_task_investigation: () => {
            console.log('🔍 Navigating to PICK task investigation');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'pick_task_investigation',
                    breadcrumb: 'Home > Investigation > PICK Task Analysis'
                }
            }));
        },

        navigate_to_scan_logs: () => {
            console.log('📊 Navigating to scan logs analysis');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'scan_logs',
                    breadcrumb: 'Home > Investigation > Scan Logs Analysis'
                }
            }));
        },


        navigate_to_camera_footage: () => {
            console.log('📹 Navigating to camera footage analysis');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'camera_footage',
                    breadcrumb: 'Home > Investigation > Camera Footage Analysis'
                }
            }));
        },

        view_camera_footage: () => {
            console.log('📹 Viewing camera footage');
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'camera_footage',
                    breadcrumb: 'Home > Investigation > Camera Footage'
                }
            }));
        },

        // Duplicate scan actions
        remove_duplicate_scan: () => {
            console.log('🗑️ Removing duplicate scan');
            alert('Duplicate scan has been flagged for removal. System will be updated.');
        },

        auto_correct_duplicates: () => {
            console.log('⚡ Auto-correcting duplicates');
            updateFlowState((prev: any) => ({
                ...prev,
                duplicateScans: [], // Clear duplicates
                resolution: {
                    ...prev.resolution,
                    status: 'resolved',
                    message: 'Duplicate scans automatically corrected. Inventory discrepancy resolved.',
                    actions_taken: [
                        'Duplicate scans identified and removed',
                        'System quantities auto-corrected',
                        'Worker training reminder scheduled'
                    ]
                },
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Investigation > Auto-Resolution'
                }
            }));
        },

        request_manual_review: () => {
            console.log('👨‍💼 Requesting manual review');
            updateFlowState((prev: any) => ({
                ...prev,
                resolution: {
                    ...prev.resolution,
                    status: 'escalated',
                    message: 'Duplicate scan issues require manual supervisor review',
                    supervisor_notified: true
                },
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Investigation > Manual Review'
                }
            }));
        },

        // Camera footage actions
        save_footage_evidence: () => {
            console.log('💾 Saving footage as evidence');
            alert('Camera footage saved as evidence:\n- Timestamp: 10:10-10:20\n- Camera: CAM-ZA-01\n- Evidence ID: VID_PICK789_001\n- Status: Saved to case file');
        },

        download_footage: () => {
            console.log('📥 Downloading footage');
            alert('Downloading footage...\n- File: CAM-ZA-01_20250910_1010-1020.mp4\n- Size: 245 MB\n- Download will begin shortly');
        },

        share_with_supervisor: () => {
            console.log('📤 Sharing with supervisor');
            alert('Footage shared with supervisor:\n- Recipient: Supervisor Johnson\n- Priority: High\n- Message: "Requires review for worker training assessment"\n- Status: Shared successfully');
        },

        view_transaction_details: () => {
            console.log('📋 Viewing transaction details');
            alert('Transaction details would show complete information about this specific operation');
        },

        // Worker handlers
        flag_worker_for_review: () => {
            console.log('🚩 Flagging worker for review');
            alert('Worker flagged for supervisor review:\n- Performance review scheduled\n- Additional training recommended\n- Supervisor notification sent');
        },

        worker_not_flaggable: () => {
            console.log('✅ Worker performance acceptable');
            alert('Worker performance is within acceptable limits. No action required.');
        },

        schedule_training: () => {
            console.log('📚 Scheduling training');
            alert('Training session scheduled:\n- Date: Next Tuesday 2:00 PM\n- Topic: Accurate Operations Procedures\n- Duration: 2 hours\n- Trainer: Supervisor Johnson');
        },

        schedule_scanner_maintenance: () => {
            console.log('🔧 Scheduling scanner maintenance');
            const maintenanceData = {
                ticketId: 'MNT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                deviceId: 'SC-2847',
                priority: 'High',
                scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(), // Tomorrow
                technicianAssigned: 'Tech Team Alpha',
                estimatedDuration: '2-3 hours'
            };

            alert(`🔧 Scanner Maintenance Scheduled Successfully!\n\n` +
                `📋 Maintenance Ticket: ${maintenanceData.ticketId}\n` +
                `📱 Device: ${maintenanceData.deviceId} (Faulty Scanner)\n` +
                `⚡ Priority: ${maintenanceData.priority}\n` +
                `📅 Scheduled: ${maintenanceData.scheduledDate} at 9:00 AM\n` +
                `👨‍🔧 Assigned to: ${maintenanceData.technicianAssigned}\n` +
                `⏱️ Estimated Duration: ${maintenanceData.estimatedDuration}\n\n` +
                `📧 Notification sent to maintenance team\n` +
                `📞 Emergency contact: ext. 2847\n` +
                `🔄 Scanner replacement unit will be provided during maintenance`);

            // Update flow state to show maintenance has been scheduled
            updateFlowState((prev: any) => ({
                ...prev,
                maintenanceScheduled: {
                    isScheduled: true,
                    ticketId: maintenanceData.ticketId,
                    scheduledDate: maintenanceData.scheduledDate,
                    deviceId: maintenanceData.deviceId
                }
            }));
        },

        update_system_inventory: () => {
            console.log('🔧 Updating system inventory');
            alert(`🔧 System Inventory Updated Successfully!\n\n` +
                `📋 Discrepancy: PICK5847 resolved\n` +
                `📦 Product: ${warehouseFlowData.discrepancy.productId}\n` +
                `📍 Location: ${warehouseFlowData.discrepancy.zoneId}\n\n` +
                `Previous System Count: 8 units (incorrect due to scanner malfunction)\n` +
                `Updated System Count: 15 units (actual physical quantity)\n` +
                `Adjustment: +7 units\n\n` +
                `✅ Investigation findings:\n` +
                `• Scanner malfunction confirmed\n` +
                `• Worker followed correct procedures\n` +
                `• Actual quantity matches expected (15 units)\n\n` +
                `🔄 Actions completed:\n` +
                `• System inventory corrected\n` +
                `• Scanner marked for replacement\n` +
                `• Maintenance ticket generated\n` +
                `• Investigation report available`);

            // Update flow state to show resolution
            updateFlowState((prev: any) => ({
                ...prev,
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Discrepancy Alert > Resolution Complete'
                },
                discrepancy: {
                    ...prev.discrepancy,
                    systemQuantity: 15, // Corrected system count
                    status: 'resolved'
                },
                resolution: {
                    status: "resolved",
                    message: "Scanner malfunction identified and system inventory corrected.",
                    investigation_conducted: true, // Full investigation was completed
                    actions_taken: [
                        "Investigation conducted - scanner malfunction found",
                        "System quantity updated from 8 to 15 units",
                        "Scanner marked for replacement",
                        "Maintenance ticket generated",
                        "Investigation report completed"
                    ],
                    final_quantity: 15,
                    supervisor_notified: false,
                    root_cause: "Hardware failure - scanner device malfunction",
                    corrective_actions: "System update + equipment replacement"
                }
            }));
        },

        // Investigation report generation handlers
        generate_pick_task_report: () => {
            console.log('📋 Generating PICK task investigation report');
            const reportData = {
                reportId: 'PICK-RPT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                generatedAt: new Date().toLocaleString(),
                discrepancyId: 'PICK5847',
                investigationType: 'PICK Task Analysis',
                title: 'PICK Task Investigation Report',
                status: 'completed',
                sections: [
                    { label: 'Discrepancy ID', value: 'PICK5847' },
                    { label: 'Location', value: 'Zone A-12, Shelf 3' },
                    { label: 'Worker ID', value: 'W2847 (John Smith)' },
                    { label: 'Scanner Device', value: 'SC-2847 (Faulty)' },
                    { label: 'Expected Quantity', value: '15 units' },
                    { label: 'Scanned Quantity', value: '8 units' },
                    { label: 'Actual Quantity', value: '15 units' },
                    { label: 'Discrepancy', value: '7 units (Scanner Error)' },
                    { label: 'Time of Incident', value: '14:35:42' },
                    { label: 'Investigation Status', value: 'Scanner malfunction confirmed' },
                    { label: 'Root Cause', value: 'Hardware failure in scanner device' },
                    { label: 'Worker Compliance', value: 'Followed all procedures correctly' },
                    { label: 'Immediate Action', value: 'Scanner replaced' },
                    { label: 'System Update', value: 'Inventory corrected to 15 units' },
                    { label: 'Recommended Actions', value: 'Schedule equipment maintenance, Replace faulty scanner' },
                    { label: 'Report Generated By', value: 'System Investigation AI' },
                ]
            };

            updateFlowState((prev: any) => ({
                ...prev,
                reportModal: {
                    isOpen: true,
                    data: reportData
                }
            }));
        },

        generate_scan_logs_report: () => {
            console.log('📋 Generating scan logs analysis report');
            const reportData = {
                reportId: 'SCAN-RPT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                generatedAt: new Date().toLocaleString(),
                discrepancyId: 'PICK5847',
                investigationType: 'Scan Logs Analysis',
                title: 'Scan Logs Analysis Report',
                status: 'completed',
                sections: [
                    { label: 'Discrepancy ID', value: 'PICK5847' },
                    { label: 'Analysis Period', value: '14:30 - 15:00' },
                    { label: 'Total Scans Analyzed', value: '47 scan events' },
                    { label: 'Anomalies Detected', value: '3 critical anomalies' },
                    { label: 'Scanner Device', value: 'SC-2847' },
                    { label: 'First Anomaly', value: '14:35:12 - Scanner timeout (5.2s)' },
                    { label: 'Second Anomaly', value: '14:35:18 - Failed scan attempt' },
                    { label: 'Third Anomaly', value: '14:35:42 - Incomplete data capture' },
                    { label: 'Pattern Analysis', value: 'Consistent hardware failure pattern' },
                    { label: 'Response Time', value: 'Average: 8.3s (Normal: 1.2s)' },
                    { label: 'Error Rate', value: '6.4% (Normal: <0.1%)' },
                    { label: 'Data Integrity', value: 'System maintained accuracy' },
                    { label: 'Root Cause', value: 'Scanner hardware malfunction' },
                    { label: 'Impact Assessment', value: 'Localized to single device' },
                    { label: 'Corrective Action', value: 'Device replacement completed' },
                    { label: 'System Status', value: 'All logs processed successfully' },
                ]
            };

            updateFlowState((prev: any) => ({
                ...prev,
                reportModal: {
                    isOpen: true,
                    data: reportData
                }
            }));
        },

        generate_camera_footage_report: () => {
            console.log('📋 Generating camera footage analysis report');
            const reportData = {
                reportId: 'CAM-RPT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                generatedAt: new Date().toLocaleString(),
                discrepancyId: 'PICK5847',
                investigationType: 'Camera Footage Analysis',
                title: 'Camera Footage Analysis Report',
                status: 'completed',
                sections: [
                    { label: 'Discrepancy ID', value: 'PICK5847' },
                    { label: 'Camera Location', value: 'Zone A-12, Overhead Cam #3' },
                    { label: 'Footage Period', value: '14:30:00 - 15:00:00' },
                    { label: 'Resolution', value: '1080p HD' },
                    { label: 'Total Duration', value: '30 minutes reviewed' },
                    { label: 'Key Events Identified', value: '5 significant events' },
                    { label: 'Event 1', value: '14:34:15 - Worker approaches shelf' },
                    { label: 'Event 2', value: '14:35:12 - Scanner activation attempt' },
                    { label: 'Event 3', value: '14:35:42 - Multiple scan attempts visible' },
                    { label: 'Event 4', value: '14:36:20 - Worker examines scanner display' },
                    { label: 'Event 5', value: '14:37:45 - Worker completes task manually' },
                    { label: 'Worker Behavior', value: 'Professional, followed all protocols' },
                    { label: 'Equipment Malfunction', value: 'Scanner display errors visible' },
                    { label: 'Security Assessment', value: 'No unauthorized access detected' },
                    { label: 'Evidence Quality', value: 'Clear footage, well-lit area' },
                    { label: 'Conclusion', value: 'Hardware failure confirmed, worker compliant' },
                ]
            };

            updateFlowState((prev: any) => ({
                ...prev,
                reportModal: {
                    isOpen: true,
                    data: reportData
                }
            }));
        },


        // Recount result handlers
        generate_discrepancy_report: () => {
            console.log('📋 Generating discrepancy report');
            const reportData = {
                reportId: 'RPT-2024-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                generatedAt: new Date().toISOString(),
                generatedBy: 'Warehouse Operator',
                status: 'Complete'
            };
            
            updateFlowState((prev: any) => ({
                ...prev,
                reportModal: {
                    isOpen: true,
                    data: reportData
                },
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'report_modal',
                    breadcrumb: 'Home > Discrepancy Alert > Report Generated'
                }
            }));
        },

        trigger_supervisor_audit: () => {
            console.log('👨‍💼 Triggering supervisor audit');
            updateFlowState((prev: any) => ({
                ...prev,
                resolution: {
                    ...prev.resolution,
                    status: 'escalated',
                    message: 'Supervisor audit triggered for detailed review',
                    supervisor_notified: true
                },
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Discrepancy Alert > Supervisor Audit'
                }
            }));
        },

        adjust_system_stock: () => {
            console.log('📦 Adjusting system stock');
            const currentFlowData = flowData;
            const enteredCount = currentFlowData?.recountCalculation?.enteredCount || 0;
            updateFlowState((prev: any) => ({
                ...prev,
                resolution: {
                    ...prev.resolution,
                    status: 'resolved',
                    message: `System stock adjusted to match physical count (${enteredCount} units)`,
                    actions_taken: [
                        ...prev.resolution.actions_taken,
                        `System stock updated to ${enteredCount} units`,
                        'Inventory sync completed'
                    ]
                },
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Discrepancy Alert > Stock Adjusted'
                }
            }));
        },

        verify_scan_accuracy: () => {
            console.log('🔍 Verifying scan accuracy');
            alert('Scan Accuracy Verification:\n- Checking recent scan logs\n- Validating barcode readings\n- Cross-referencing worker performance\n- Status: Verification in progress');
        },

        close_investigation: () => {
            console.log('✅ Closing investigation');
            updateFlowState((prev: any) => ({
                ...prev,
                resolution: {
                    ...prev.resolution,
                    status: 'resolved',
                    message: 'Investigation closed successfully. No further action required.',
                    actions_taken: [
                        ...prev.resolution.actions_taken,
                        'Investigation closed',
                        'Final report generated'
                    ]
                },
                currentFlow: {
                    ...prev.currentFlow,
                    step: 'resolution',
                    breadcrumb: 'Home > Discrepancy Alert > Investigation Closed'
                }
            }));
        },

        // Final resolution handlers
        start_new_investigation: () => {
            console.log('🔄 Starting new investigation');
            // Reset to initial state with proper flow reset
            const resetData = {
                ...warehouseFlowData,
                currentFlow: {
                    step: 'alert',
                    breadcrumb: 'Home > Discrepancy Alert'
                }
            };
            setFlowData(resetData);

            // Also reset preview messages if in preview mode
            if (mode === 'preview') {
                setPreviewMessages([]);
            }
        },

        view_full_report: () => {
            console.log('📊 Viewing full report');

            // Generate comprehensive report data
            const reportId = `RPT-${Date.now()}`;
            const generatedAt = new Date().toLocaleString();

            updateFlowState((prev: any) => ({
                ...prev,
                reportModal: {
                    isOpen: true,
                    data: {
                        title: "Warehouse Discrepancy Investigation Report",
                        reportId: reportId,
                        generatedAt: generatedAt,
                        generatedBy: "System Administrator",
                        investigationType: "Inventory Discrepancy",
                        status: prev.resolution?.status === 'escalated' ? 'escalated' : 'completed',
                        sections: [
                            {
                                title: "Executive Summary",
                                content: prev.resolution?.status === 'escalated'
                                    ? `Investigation escalated for ${prev.discrepancy?.productName || 'Product'}. Supervisor review required for discrepancy of ${prev.discrepancy?.discrepancyAmount || 'N/A'} units.`
                                    : `Investigation completed for ${prev.discrepancy?.productName || 'Product'}. Discrepancy of ${prev.discrepancy?.discrepancyAmount || 'N/A'} units resolved through physical recount and system adjustment.`
                            },
                            {
                                title: "Initial Discrepancy Details",
                                content: `Product: ${prev.discrepancy?.productName || 'N/A'}\nLocation: ${prev.discrepancy?.zoneId || 'N/A'}\nExpected Quantity: ${prev.discrepancy?.expectedQuantity || 'N/A'} units\nSystem Quantity: ${prev.discrepancy?.systemQuantity || 'N/A'} units\nDiscrepancy: ${prev.discrepancy?.discrepancyAmount || 'N/A'} units missing`
                            },
                            {
                                title: "Investigation Actions Taken",
                                content: prev.resolution?.actions_taken?.join('\n• ') || "Physical recount conducted\n• System quantity updated\n• Worker training scheduled\n• Discrepancy report generated"
                            },
                            {
                                title: prev.resolution?.status === 'escalated' ? "Escalation Details" : "Final Resolution",
                                content: prev.resolution?.status === 'escalated'
                                    ? `Status: Escalated to Supervisor\nReason: ${prev.resolution?.message || 'Requires supervisor review'}\nSupervisor Notified: ${prev.resolution?.supervisor_notified ? 'Yes' : 'No'}\nEscalation Date: ${generatedAt}`
                                    : `Status: ${prev.resolution?.status || 'Resolved'}\nFinal Quantity: ${prev.resolution?.final_quantity || prev.discrepancy?.expectedQuantity || 'N/A'} units\nSystem Updated: Yes\nSupervisor Notified: ${prev.resolution?.supervisor_notified ? 'Yes' : 'No'}`
                            },
                            {
                                title: "Recommendations",
                                content: prev.resolution?.status === 'escalated'
                                    ? "• Supervisor to conduct detailed review\n• Consider additional investigation resources\n• Evaluate need for process improvements\n• Schedule follow-up meeting with warehouse team"
                                    : "• Implement regular cycle counts for this product category\n• Review scanning procedures with warehouse staff\n• Monitor for similar discrepancies in the coming weeks\n• Consider barcode quality audit for this product line"
                            }
                        ]
                    }
                }
            }));
        },

        // Report modal handlers
        close_report_modal: () => {
            console.log('❌ Closing report modal');
            updateFlowState((prev: any) => ({
                ...prev,
                reportModal: {
                    ...prev.reportModal,
                    isOpen: false
                }
            }));
        },

        download_report_pdf: () => {
            console.log('📄 Downloading report as PDF');
            const getCurrentReportData = () => {
                const currentData = flowData;
                return currentData?.reportModal?.data;
            };

            const reportData = getCurrentReportData();
            if (!reportData) {
                alert('No report data available for download.');
                return;
            }

            try {
                // Create new PDF document
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                const margin = 20;
                let currentY = margin;

                // Add title
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.text(reportData.title || 'Investigation Report', margin, currentY);
                currentY += 15;

                // Add a line under title
                doc.setLineWidth(0.5);
                doc.line(margin, currentY, pageWidth - margin, currentY);
                currentY += 15;

                // Add metadata section
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');

                const metaData = [
                    `Report ID: ${reportData.reportId}`,
                    `Generated: ${reportData.generatedAt}`,
                    `Investigation Type: ${reportData.investigationType}`,
                    `Status: ${reportData.status}`
                ];

                metaData.forEach((item, index) => {
                    const xPos = index % 2 === 0 ? margin : pageWidth / 2;
                    const yPos = currentY + Math.floor(index / 2) * 8;
                    doc.text(item, xPos, yPos);
                });
                currentY += Math.ceil(metaData.length / 2) * 8 + 10;

                // Add investigation details section
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Investigation Details', margin, currentY);
                currentY += 10;

                // Prepare table data
                const tableData = reportData.sections ? reportData.sections.map((section: any) => [
                    section.label,
                    section.value
                ]) : [];

                // Add table using autoTable
                autoTable(doc, {
                    head: [['Section', 'Details']],
                    body: tableData,
                    startY: currentY,
                    margin: { left: margin, right: margin },
                    styles: {
                        fontSize: 10,
                        cellPadding: 5,
                        overflow: 'linebreak',
                        halign: 'left'
                    },
                    headStyles: {
                        fillColor: [66, 139, 202],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 11
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    columnStyles: {
                        0: { cellWidth: 60, fontStyle: 'bold' },
                        1: { cellWidth: 'auto' }
                    },
                    didDrawPage: (data) => {
                        // Add footer on each page
                        const footerY = pageHeight - 15;
                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(128, 128, 128);
                        doc.text(
                            `Generated by Warehouse Management System - ${new Date().toLocaleString()}`,
                            pageWidth / 2,
                            footerY,
                            { align: 'center' }
                        );

                        // Add page numbers
                        doc.text(
                            `Page ${data.pageNumber}`,
                            pageWidth - margin,
                            footerY,
                            { align: 'right' }
                        );
                    }
                });

                // Generate filename
                const fileName = `${reportData.investigationType?.replace(/\s+/g, '_') || 'report'}_${reportData.reportId || Date.now()}.pdf`;

                // Save the PDF
                doc.save(fileName);

                console.log(`📄 PDF Report downloaded: ${fileName}`);
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Error generating PDF report. Please try again.');
            }
        },

        download_report: () => {
            console.log('📥 Downloading report');
            alert('Report downloaded successfully!\n- File: discrepancy_report_' + new Date().getTime() + '.pdf\n- Location: Downloads folder');
        },

        email_report: () => {
            console.log('📧 Emailing report');
            alert('Report emailed successfully!\n- Recipients: supervisor@warehouse.com, manager@warehouse.com\n- Subject: Discrepancy Report - Immediate Review Required');
        },

        // Worker details handlers
        show_worker_details: (event: any) => {
            console.log('👤 Showing worker details');
            const workerId = event?.target?.getAttribute?.('data-worker-id') || 'W2847';
            const workerName = event?.target?.getAttribute?.('data-worker-name') || 'John Smith';

            updateFlowState((prev: any) => ({
                ...prev,
                workerDetails: {
                    isVisible: true,
                    workerId: workerId,
                    workerName: workerName
                }
            }));
        },

        hide_worker_details: () => {
            console.log('❌ Hiding worker details');
            updateFlowState((prev: any) => ({
                ...prev,
                workerDetails: {
                    ...prev.workerDetails,
                    isVisible: false
                }
            }));
        }
    };


    // Dev mode handler
	const handleDevSend = async () => {
		if (!devInput.trim()) return

        setDevIsLoading(true)

		const currentInput = devInput
		
		// Save prompt to history
		savePromptToHistory(currentInput)
		
		setDevMessages([...devMessages, { role: 'user', content: devInput }])
		setDevInput('')

        // Simulate processing delay for dev mode
        setTimeout(() => {
            setDevMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Development mode: I can help you generate and modify UI components. The warehouse flow is already loaded for testing and development purposes.'
            }]);

            setDevIsLoading(false)
        }, 1000)
	}

    // Preview mode handler
    const handlePreviewSend = async () => {
        if (!previewInput.trim()) return

        setPreviewIsLoading(true)

        const currentInput = previewInput
        
        // Save prompt to history
        savePromptToHistory(currentInput)
        
        setPreviewMessages([...previewMessages, { role: 'user', content: previewInput }])
        setPreviewInput('')

        // Check if the input is related to discrepancy/warehouse
        const discrepancyKeywords = ['discrepancy', 'warehouse', 'stock', 'inventory', 'recount', 'investigation', 'transaction', 'scan'];
        const isDiscrepancyQuery = discrepancyKeywords.some(keyword => 
            currentInput.toLowerCase().includes(keyword)
        );

        // Simulate processing delay for preview mode
        setTimeout(() => {
            if (isDiscrepancyQuery) {
                setPreviewMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'I\'ve loaded the warehouse discrepancy investigation flow for you. You can now interact with the system to investigate stock discrepancies, review transactions, and perform recounts.',
                    hasUI: true,
                    uiSchema: warehouseFlowDSL.warehouse_discrepancy_investigation_flow,
                    uiData: warehouseFlowData
                }]);
            } else {
                setPreviewMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'I understand you want to work with warehouse operations. Try asking about "discrepancy investigation" or "stock recount" to load the warehouse flow.'
                }]);
            }
            
            setPreviewIsLoading(false)
        }, 1500)
    }

    if (mode === 'preview') {
        // Preview Mode: Full screen UI with bottom input
        return (
            <div className="flex flex-col h-screen bg-white">
                {/* Mode Toggle */}
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={() => setMode('dev')}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-lg transition-colors font-medium flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>Dev Mode</span>
                    </button>
                </div>

                {/* ChatGPT-style Main Content Area */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-4xl mx-auto w-full px-4 py-8">
                        <div className="space-y-6">
                            {/* Welcome Screen - Only show when no messages */}
                            {previewMessages.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-3xl font-semibold text-gray-800 mb-3">Warehouse Management Assistant</h1>
                                    <p className="text-gray-500 text-lg mb-8">How can I help you with warehouse operations today?</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                                             onClick={() => setInputAndFocus('Show me the discrepancy investigation flow')}>
                                            <h3 className="font-medium text-gray-800 mb-2">Discrepancy Investigation</h3>
                                            <p className="text-sm text-gray-600">Investigate stock discrepancies and variance issues</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                                             onClick={() => setInputAndFocus('I need to perform a stock recount')}>
                                            <h3 className="font-medium text-gray-800 mb-2">Stock Recount</h3>
                                            <p className="text-sm text-gray-600">Perform physical inventory counts and reconciliation</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                                             onClick={() => setInputAndFocus('Show me transaction analysis')}>
                                            <h3 className="font-medium text-gray-800 mb-2">Transaction Analysis</h3>
                                            <p className="text-sm text-gray-600">Review and analyze warehouse transaction history</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                                             onClick={() => setInputAndFocus('Help with inventory management')}>
                                            <h3 className="font-medium text-gray-800 mb-2">Inventory Management</h3>
                                            <p className="text-sm text-gray-600">General inventory management and tracking</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Chat Messages */}
                            {previewMessages.map((msg, i) => (
                                <div key={i} className="space-y-6">
                                    {/* Message bubble */}
                                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'ml-3 bg-purple-500' : 'mr-3 bg-gray-700'}`}>
                                                {msg.role === 'user' ? (
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                                <p className="leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* UI Component - only for assistant messages with UI */}
                                    {msg.hasUI && msg.role === 'assistant' && msg.uiSchema && (
                                        <div className="w-full">
                                            {/* UI Header */}
                                            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-t-xl">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Warehouse Management System</span>
                                                </div>
                                            </div>
                                            {/* UI Container */}
                                            <div className="bg-white rounded-b-xl shadow-lg border-x border-b border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
                                                <div className="h-full overflow-auto">
                                                    <FLOWUIRenderer2
                                                        schema={msg.uiSchema}
                                                        data={msg.uiData}
                                                        handlers={handlers}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {previewIsLoading && (
                                <div className="flex justify-start">
                                    <div className="flex max-w-[80%]">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 bg-gray-700">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="rounded-2xl px-4 py-3 bg-gray-100">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                                <span className="text-sm text-gray-600">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* ChatGPT-style Bottom Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative flex items-end bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <textarea
                                ref={previewTextareaRef}
                                value={previewInput}
                                onChange={(e) => {
                                    setPreviewInput(e.target.value)
                                    if (historyIndex !== -1) {
                                        setHistoryIndex(-1)
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handlePreviewSend()
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault()
                                        navigateHistory('up')
                                    } else if (e.key === 'ArrowDown') {
                                        e.preventDefault()
                                        navigateHistory('down')
                                    }
                                }}
                                className="flex-1 resize-none border-0 bg-transparent p-4 text-gray-800 placeholder-gray-400 focus:outline-none min-h-[24px] max-h-[200px]"
                                placeholder="Message Warehouse Assistant..."
                                rows={1}
                                disabled={previewIsLoading}
                                style={{ lineHeight: '24px' }}
                            />
                            <div className="flex items-center p-2">
                                <button
                                    onClick={handlePreviewSend}
                                    disabled={previewIsLoading || !previewInput.trim()}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        previewInput.trim() && !previewIsLoading 
                                            ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-sm' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {previewIsLoading ? (
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-center mt-2">
                            {/* <p className="text-xs text-gray-400">
                                ChatGPT can make mistakes. Check important info.
                            </p> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Dev Mode: Split screen with sidebar
    return (
        <div className="flex h-screen bg-white">
            {/* Left Side - Generated React Component */}
            <div className="flex-1 bg-white bg-opacity-90 border-r border-gray-300 shadow-xl">
                <div className="h-full flex flex-col">
                    {/* Mode Toggle */}
                    <div className="absolute top-4 left-4 z-50">
                        <button
                            onClick={() => setMode('preview')}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg transition-colors font-medium flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Preview</span>
                        </button>
                    </div>
                    {/* Preview Content */}
                    <div className="flex-1 overflow-auto relative">
                        {schema ? (
                            <div className="min-h-full bg-white rounded-xl shadow-lg border border-slate-200">
                                <FLOWUIRenderer2
                                    schema={schema}
                                    data={flowData}
                                    handlers={handlers}
                                />
                            </div>
                        ) : (
                            <div className="min-h-full flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                                        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-700">Ready to Create</h3>
                                    <p className="text-slate-500 max-w-sm">Describe what you want to build and watch it come to life</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Chat Interface */}
            <div className="w-96 bg-slate-200 flex flex-col shadow-2xl">
                {/* Chat Header */}
                <div className="px-6 py-4 bg-purple-500 text-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.11 3.89 21 5 21H11V19H5V3H13V9H21Z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">SA AI Assistant</h2>
                            <p className="text-sm text-white/70">Development Mode</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div ref={devMessagesRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50">
                    {devMessages.length === 0 && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 text-sm">Development mode: Generate and modify UI components</p>
                        </div>
                    )}
                    
                    {devMessages.map((msg, i) => (
                        <div key={i} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2.5 rounded-2xl max-w-[85%] shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-800 shadow-md'
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    
                    {devIsLoading && (
                        <div className="text-left">
                            <div className="inline-block p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
                                <div className="flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                    <span className="text-sm text-slate-600">Generating your UI...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-2.5">
                    <div className="space-y-3">
                        <textarea
                            value={devInput}
                            onChange={(e) => {
                                setDevInput(e.target.value)
                                // Reset history index when user types
                                if (historyIndex !== -1) {
                                    setHistoryIndex(-1)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleDevSend()
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault()
                                    navigateHistory('up')
                                } else if (e.key === 'ArrowDown') {
                                    e.preventDefault()
                                    navigateHistory('down')
                                }
                            }}
                            className="w-full p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-slate-400"
                            placeholder="Describe your UI modifications... (e.g., 'Add a filter button to the table')"
                            rows={3}
                            disabled={devIsLoading}
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-500">
                                Dev Mode • Enter to send • Shift+Enter for new line • ↑/↓ for history
                            </p>
                            <button
                                onClick={handleDevSend}
                                disabled={devIsLoading || !devInput.trim()}
                                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                            >
                                {devIsLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                        </svg>
                                        <span>Generating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>Generate</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseApp;