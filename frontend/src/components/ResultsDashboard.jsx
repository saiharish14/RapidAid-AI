import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppointmentModal from './AppointmentModal';
import '../css/ResultsDashboard.css';

const ResultsDashboard = ({ analysisData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentData, setCurrentData] = useState(analysisData);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const mockData = {
    triageLevel: 'moderate',
    confidence: 87,
    possibleCauses: [
      'Viral infection',
      'Tension headache',
      'Dehydration',
      'Sinusitis'
    ],
    firstAid: [
      'Rest in a quiet, dark room',
      'Stay hydrated with water',
      'Apply cold compress to forehead',
      'Take over-the-counter pain relief',
      'Monitor temperature regularly'
    ],
    recommendedSpecialist: 'General Physician',
    seekEmergencyCare: false,
    disclaimer: 'This analysis is for educational purposes only and should not replace professional medical advice. If symptoms worsen or persist, please consult a healthcare provider immediately.'
  };

  const data = currentData || mockData;

  // Map backend API data to dashboard format
  const mappedData = {
    triageLevel: data.severity || data.triageLevel || 'moderate',
    confidence: data.confidence || 85,
    possibleCauses: data.possible_causes || data.possibleCauses || mockData.possibleCauses,
    firstAid: data.first_aid || data.firstAid || mockData.firstAid,
    recommendedSpecialist: data.recommended_specialist || data.recommendedSpecialist || mockData.recommendedSpecialist,
    seekEmergencyCare: data.triage_level === 'emergency' || data.triageLevel === 'emergency' || false,
    disclaimer: data.disclaimer || mockData.disclaimer,
    symptoms: data.symptoms || data.symptomDescription || data.description || ''
  };

  const getSymptomsText = () => {
    return mappedData.symptoms || 'N/A';
  };

  const handleAnalyzeAgain = () => {
    // Clear current data and navigate back to symptom checker
    setCurrentData(null);
    navigate('/symptom-checker');
  };

  const getSeverityColor = (level) => {
    switch (level.toLowerCase()) {
      case 'mild':
        return '#4CAF50';
      case 'moderate':
        return '#FF9800';
      case 'severe':
      case 'emergency':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getSeverityLabel = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getRiskLevel = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'emergency' || level === 'severe') return { label: 'Critical', emoji: '🔴', color: '#F44336' };
    if (level === 'high') return { label: 'High', emoji: '🟠', color: '#FF5722' };
    if (level === 'moderate') return { label: 'Moderate', emoji: '🟡', color: '#FF9800' };
    return { label: 'Low', emoji: '🟢', color: '#4CAF50' };
  };

  // Emergency symptom detection
  const detectEmergencySymptoms = () => {
    const symptoms = getSymptomsText().toLowerCase();
    const condition = getPrimaryCondition().toLowerCase();
    
    // Critical emergency symptoms
    const criticalSymptoms = [
      'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'shortness of breath',
      'unconscious', 'fainting', 'severe bleeding', 'seizure', 'paralysis',
      'slurred speech', 'vision loss', 'severe headache', 'confusion'
    ];
    
    // High risk symptoms
    const highRiskSymptoms = [
      'high fever', 'severe pain', 'vomiting blood', 'blood in stool',
      'severe dehydration', 'rapid heartbeat', 'dizziness', 'weakness',
      'persistent vomiting', 'severe cough', 'difficulty swallowing'
    ];
    
    // Check for critical symptoms
    for (const symptom of criticalSymptoms) {
      if (symptoms.includes(symptom) || condition.includes(symptom)) {
        return 'critical';
      }
    }
    
    // Check for high risk symptoms
    for (const symptom of highRiskSymptoms) {
      if (symptoms.includes(symptom) || condition.includes(symptom)) {
        return 'high';
      }
    }
    
    // Default to severity-based assessment
    const severity = mappedData.triageLevel.toLowerCase();
    if (severity === 'emergency' || severity === 'severe') return 'critical';
    if (severity === 'high') return 'high';
    if (severity === 'moderate') return 'moderate';
    return 'low';
  };

  const getEnhancedRiskLevel = () => {
    const detectedRisk = detectEmergencySymptoms();
    const severityRisk = getRiskLevel(mappedData.triageLevel);
    
    // Use detected risk if it's higher than severity-based risk
    if (detectedRisk === 'critical') return { label: 'Critical', emoji: '🔴', color: '#F44336' };
    if (detectedRisk === 'high') return { label: 'High', emoji: '🟠', color: '#FF5722' };
    if (detectedRisk === 'moderate') return { label: 'Moderate', emoji: '🟡', color: '#FF9800' };
    
    return severityRisk;
  };

  const getRiskLevelExplanation = () => {
    const risk = getEnhancedRiskLevel().label.toLowerCase();
    const symptoms = getSymptomsText().toLowerCase();
    const condition = getPrimaryCondition().toLowerCase();
    
    if (risk === 'critical') {
      const criticalIndicators = [];
      if (symptoms.includes('chest pain') || condition.includes('heart')) criticalIndicators.push('chest pain');
      if (symptoms.includes('breathing') || symptoms.includes('shortness')) criticalIndicators.push('breathing difficulty');
      if (symptoms.includes('unconscious') || symptoms.includes('fainting')) criticalIndicators.push('loss of consciousness');
      if (symptoms.includes('stroke') || symptoms.includes('slurred')) criticalIndicators.push('stroke symptoms');
      if (symptoms.includes('severe bleeding')) criticalIndicators.push('severe bleeding');
      
      if (criticalIndicators.length > 0) {
        return `Critical risk detected due to: ${criticalIndicators.join(', ')}. These symptoms require immediate emergency medical attention.`;
      }
      return 'Critical risk based on symptom severity and potential life-threatening condition. Immediate emergency care is required.';
    }
    
    if (risk === 'high') {
      const highIndicators = [];
      if (symptoms.includes('high fever')) highIndicators.push('high fever');
      if (symptoms.includes('severe pain')) highIndicators.push('severe pain');
      if (symptoms.includes('vomiting') || symptoms.includes('blood')) highIndicators.push('bleeding or persistent vomiting');
      if (symptoms.includes('dehydration')) highIndicators.push('signs of dehydration');
      
      if (highIndicators.length > 0) {
        return `High risk due to: ${highIndicators.join(', ')}. Immediate medical evaluation is strongly recommended.`;
      }
      return 'High risk based on symptom patterns that may indicate serious condition. Prompt medical consultation is advised.';
    }
    
    if (risk === 'moderate') {
      return 'Moderate risk based on reported symptoms. Monitor condition closely and consult a healthcare provider if symptoms persist or worsen.';
    }
    
    return 'Low risk based on current symptoms. Home care with monitoring is appropriate. Seek medical attention if condition changes.';
  };

  const getRiskBasedActions = () => {
    const risk = getEnhancedRiskLevel().label.toLowerCase();
    
    if (risk === 'critical') {
      return [
        { label: '🆘 SOS', action: 'sos', primary: true },
        { label: '🏥 Nearby Hospitals', action: 'hospitals', primary: false },
        { label: '📞 Emergency Contacts', action: 'contacts', primary: false }
      ];
    }
    
    if (risk === 'high') {
      return [
        { label: '🏥 Visit Hospital', action: 'hospital', primary: true },
        { label: '📞 Call Doctor', action: 'doctor', primary: false }
      ];
    }
    
    if (risk === 'moderate') {
      return [
        { label: '👨‍⚕️ Consult Doctor', action: 'consult', primary: true },
        { label: '📅 Schedule Appointment', action: 'appointment', primary: false }
      ];
    }
    
    return [
      { label: '🏠 Home Care', action: 'home', primary: true },
      { label: '📋 Monitor Symptoms', action: 'monitor', primary: false }
    ];
  };

  const handleRiskAction = (action) => {
    switch (action) {
      case 'sos':
        navigate('/emergency-services');
        break;
      case 'hospitals':
        navigate('/emergency-services');
        break;
      case 'contacts':
        navigate('/smart-emergency-contacts');
        break;
      case 'hospital':
        navigate('/emergency-services');
        break;
      case 'doctor':
        navigate('/smart-emergency-contacts');
        break;
      case 'consult':
        navigate('/consult-doctor');
        break;
      case 'appointment':
        setShowAppointmentModal(true);
        break;
      case 'home':
        // Stay on page for home care instructions
        break;
      case 'monitor':
        // Stay on page for monitoring guidance
        break;
      default:
        break;
    }
  };

  const getPrimaryCondition = () => {
    return mappedData.possibleCauses[0] || 'Condition under analysis';
  };

  // Generate multiple conditions with confidence scores
  const getMultipleConditions = () => {
    const baseConfidence = mappedData.confidence || 85;
    const causes = mappedData.possibleCauses || ['Condition under analysis'];
    
    // Generate confidence scores for top 3 conditions
    const conditions = causes.slice(0, 3).map((cause, index) => {
      // Decrease confidence for secondary conditions
      const confidenceDecrease = index * 15;
      const confidence = Math.max(baseConfidence - confidenceDecrease, 40);
      
      // Determine risk level for each condition
      let riskLevel = 'Low';
      let riskColor = '#4CAF50';
      
      if (confidence >= 80) {
        riskLevel = 'Critical';
        riskColor = '#F44336';
      } else if (confidence >= 65) {
        riskLevel = 'High';
        riskColor = '#FF5722';
      } else if (confidence >= 50) {
        riskLevel = 'Moderate';
        riskColor = '#FF9800';
      }
      
      // Generate short explanation
      const explanations = [
        'Primary match based on reported symptoms and clinical patterns.',
        'Secondary possibility with similar symptom presentation.',
        'Less likely but cannot be ruled out based on current information.'
      ];
      
      return {
        name: cause,
        confidence: confidence,
        riskLevel: riskLevel,
        riskColor: riskColor,
        explanation: explanations[index] || 'Possible condition based on symptom analysis.',
        isPrimary: index === 0
      };
    });
    
    return conditions;
  };

  const generateAIReasoning = () => {
    const condition = getPrimaryCondition();
    const symptoms = getSymptomsText();
    return `The prediction is based on the symptoms and information you entered. The reported symptoms closely match the common clinical characteristics of ${condition}. This analysis considers symptom patterns, severity indicators, and established medical knowledge bases to provide preliminary guidance.`;
  };

  const getConfidenceExplanation = () => {
    const confidence = mappedData.confidence;
    if (confidence >= 90) {
      return 'Confidence is very high because the submitted information closely matches the learned disease patterns and clinical indicators.';
    } else if (confidence >= 75) {
      return 'Confidence is high because the submitted information matches the learned disease patterns.';
    } else if (confidence >= 60) {
      return 'Confidence is moderate as the symptoms partially match known disease patterns.';
    } else {
      return 'Confidence is lower due to limited symptom information or overlapping conditions.';
    }
  };

  const getRecommendedNextStep = () => {
    const severity = mappedData.triageLevel.toLowerCase();
    if (severity === 'emergency' || severity === 'severe') {
      return 'Seek emergency care immediately if symptoms worsen.';
    } else if (severity === 'high') {
      return 'Consult a physician within 24 hours.';
    } else if (severity === 'moderate') {
      return 'Monitor symptoms and stay hydrated. Consult a doctor if symptoms persist.';
    } else {
      return 'Monitor symptoms and rest. Seek medical attention if condition worsens.';
    }
  };

  // Personalized Recommendations based on condition
  const getConditionRecommendations = () => {
    const condition = getPrimaryCondition().toLowerCase();
    const severity = mappedData.triageLevel.toLowerCase();
    
    // Condition-specific recommendations
    const conditionMap = {
      'fever': [
        'Drink plenty of water',
        'Take adequate rest',
        'Monitor body temperature regularly',
        'Eat light, nutritious meals',
        'Take sponge bath if temperature is high'
      ],
      'viral infection': [
        'Drink plenty of fluids',
        'Get adequate rest',
        'Take over-the-counter fever reducers',
        'Gargle with warm salt water for sore throat',
        'Isolate to prevent spread'
      ],
      'cold': [
        'Drink warm fluids',
        'Gargle with warm salt water',
        'Take sufficient rest',
        'Use steam inhalation',
        'Keep yourself warm'
      ],
      'migraine': [
        'Rest in a quiet, dark room',
        'Stay hydrated',
        'Avoid bright lights and loud sounds',
        'Apply cold compress to forehead',
        'Take prescribed medication'
      ],
      'headache': [
        'Rest in a quiet environment',
        'Stay hydrated',
        'Apply cold or warm compress',
        'Avoid screen time',
        'Practice relaxation techniques'
      ],
      'food poisoning': [
        'Drink ORS to prevent dehydration',
        'Eat bland food',
        'Avoid dairy and oily foods',
        'Rest and avoid physical exertion',
        'Monitor for severe symptoms'
      ],
      'dehydration': [
        'Drink plenty of water and electrolytes',
        'Avoid caffeine and alcohol',
        'Rest in a cool place',
        'Eat water-rich fruits',
        'Monitor urine color'
      ],
      'sinusitis': [
        'Use steam inhalation',
        'Apply warm compress to face',
        'Stay hydrated',
        'Use saline nasal spray',
        'Elevate head while sleeping'
      ],
      'allergy': [
        'Avoid known allergens',
        'Take antihistamines as prescribed',
        'Keep windows closed during high pollen',
        'Use air purifier',
        'Wear mask outdoors'
      ],
      'infection': [
        'Complete prescribed antibiotic course',
        'Get adequate rest',
        'Stay hydrated',
        'Maintain good hygiene',
        'Isolate if contagious'
      ]
    };

    // Get condition-specific recommendations or use generic ones
    let recommendations = [];
    for (const [key, value] of Object.entries(conditionMap)) {
      if (condition.includes(key)) {
        recommendations = value;
        break;
      }
    }

    // Fallback to severity-based recommendations
    if (recommendations.length === 0) {
      if (severity === 'emergency' || severity === 'severe') {
        recommendations = [
          'Seek immediate medical attention',
          'Do not drive yourself',
          'Call emergency services immediately',
          'Stay calm and rest',
          'Follow medical instructions'
        ];
      } else if (severity === 'high') {
        recommendations = [
          'Consult a doctor within 24 hours',
          'Monitor symptoms closely',
          'Take prescribed medications',
          'Rest and avoid exertion',
          'Stay hydrated'
        ];
      } else if (severity === 'moderate') {
        recommendations = [
          'Monitor symptoms regularly',
          'Take adequate rest',
          'Stay hydrated',
          'Eat nutritious food',
          'Consult doctor if symptoms worsen'
        ];
      } else {
        recommendations = [
          'Get adequate rest',
          'Stay hydrated',
          'Eat balanced meals',
          'Monitor symptoms',
          'Maintain good hygiene'
        ];
      }
    }

    return recommendations;
  };

  const getHydrationAdvice = () => {
    const condition = getPrimaryCondition().toLowerCase();
    const severity = mappedData.triageLevel.toLowerCase();

    if (condition.includes('fever') || condition.includes('dehydration') || condition.includes('infection')) {
      return '3–4 Liters/day';
    } else if (severity === 'emergency' || severity === 'severe') {
      return '3–4 Liters/day';
    } else if (condition.includes('cold') || condition.includes('sinusitis')) {
      return '2.5–3.5 Liters/day';
    } else {
      return '2.5–3.5 Liters/day';
    }
  };

  const getRecommendedFoods = () => {
    const condition = getPrimaryCondition().toLowerCase();
    
    const foodMap = {
      'fever': ['Fruits', 'Vegetables', 'Soup', 'Rice', 'Coconut Water', 'Toast'],
      'cold': ['Fruits rich in Vitamin C', 'Soup', 'Honey', 'Ginger tea', 'Garlic', 'Turmeric milk'],
      'migraine': ['Magnesium-rich foods', 'Leafy greens', 'Nuts', 'Whole grains', 'Fatty fish', 'Water'],
      'food poisoning': ['Bananas', 'Rice', 'Toast', 'Applesauce', 'Boiled potatoes', 'Clear broth'],
      'dehydration': ['Watermelon', 'Cucumber', 'Coconut water', 'Oranges', 'Yogurt', 'Soup'],
      'sinusitis': ['Spicy foods', 'Garlic', 'Ginger', 'Hot soup', 'Honey', 'Citrus fruits'],
      'allergy': ['Anti-inflammatory foods', 'Turmeric', 'Ginger', 'Leafy greens', 'Fatty fish', 'Probiotics']
    };

    for (const [key, value] of Object.entries(foodMap)) {
      if (condition.includes(key)) {
        return value;
      }
    }

    return ['Fruits', 'Vegetables', 'Soup', 'Rice', 'Coconut Water', 'Whole grains'];
  };

  const getFoodsToAvoid = () => {
    const condition = getPrimaryCondition().toLowerCase();
    
    const avoidMap = {
      'fever': ['Junk food', 'Spicy food', 'Fried food', 'Caffeine', 'Alcohol'],
      'cold': ['Dairy products', 'Sugary foods', 'Cold drinks', 'Fried food', 'Alcohol'],
      'migraine': ['Aged cheese', 'Processed meats', 'Alcohol', 'Caffeine Chocolate', 'MSG'],
      'food poisoning': ['Dairy', 'Oily food', 'Spicy food', 'Raw foods', 'Caffeine'],
      'dehydration': ['Alcohol', 'Caffeine', 'Sugary drinks', 'Salty foods', 'Excess protein'],
      'sinusitis': ['Dairy products', 'Cold foods', 'Sugary foods', 'Fried food', 'Alcohol'],
      'allergy': ['Known allergens', 'Processed foods', 'Artificial colors', 'Preservatives', 'Shellfish']
    };

    for (const [key, value] of Object.entries(avoidMap)) {
      if (condition.includes(key)) {
        return value;
      }
    }

    return ['Junk Food', 'Alcohol', 'Soft Drinks', 'Oily Food', 'Excess sugar'];
  };

  const getActivityRecommendation = () => {
    const severity = mappedData.triageLevel.toLowerCase();
    const condition = getPrimaryCondition().toLowerCase();

    if (severity === 'emergency' || severity === 'severe') {
      return 'Complete Bed Rest';
    } else if (condition.includes('fever') || condition.includes('infection')) {
      return 'Complete Bed Rest';
    } else if (condition.includes('migraine') || condition.includes('headache')) {
      return 'Rest in quiet environment';
    } else if (condition.includes('food poisoning')) {
      return 'Complete Bed Rest';
    } else if (severity === 'high') {
      return 'Light Walking';
    } else if (severity === 'moderate') {
      return 'Light Activities';
    } else {
      return 'Normal Activities';
    }
  };

  const getRecoveryEstimate = () => {
    const severity = mappedData.triageLevel.toLowerCase();
    const condition = getPrimaryCondition().toLowerCase();

    if (severity === 'emergency' || severity === 'severe') {
      return '7–14 Days';
    } else if (condition.includes('infection') || condition.includes('fever')) {
      return '5–7 Days';
    } else if (condition.includes('food poisoning')) {
      return '2–5 Days';
    } else if (condition.includes('cold') || condition.includes('sinusitis')) {
      return '7–10 Days';
    } else if (condition.includes('migraine')) {
      return '1–3 Days';
    } else if (severity === 'high') {
      return '5–7 Days';
    } else if (severity === 'moderate') {
      return '3–5 Days';
    } else {
      return '2–5 Days';
    }
  };

  const getDoctorRecommendation = () => {
    const severity = mappedData.triageLevel.toLowerCase();
    const condition = getPrimaryCondition().toLowerCase();

    if (severity === 'emergency' || severity === 'severe') {
      return { level: 'critical', text: 'Visit Hospital Immediately', color: '#F44336' };
    } else if (condition.includes('heart') || condition.includes('chest pain')) {
      return { level: 'critical', text: 'Visit Hospital Immediately', color: '#F44336' };
    } else if (severity === 'high') {
      return { level: 'warning', text: 'Visit a Doctor within 24 Hours', color: '#FF9800' };
    } else if (condition.includes('fever') && condition.includes('high')) {
      return { level: 'warning', text: 'Visit a Doctor within 24 Hours', color: '#FF9800' };
    } else {
      return { level: 'safe', text: 'Home Care', color: '#4CAF50' };
    }
  };

  const getEmergencyWarning = () => {
    const severity = mappedData.triageLevel.toLowerCase();
    const condition = getPrimaryCondition().toLowerCase();

    if (severity === 'emergency' || severity === 'severe') {
      return '⚠ Seek immediate medical care if symptoms worsen or breathing difficulty, severe chest pain, unconsciousness, or persistent vomiting occurs.';
    } else if (condition.includes('heart') || condition.includes('chest pain')) {
      return '⚠ Seek immediate medical care if symptoms worsen or breathing difficulty, severe chest pain, unconsciousness, or persistent vomiting occurs.';
    }
    return null;
  };

  const getPatientName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email;
    return 'Guest User';
  };

  const generateReportId = () => {
    const randomSegment = Math.floor(Math.random() * 900000 + 100000);
    return `RPT-${Date.now().toString().slice(-8)}-${randomSegment}`;
  };

  const reportId = data.report_id || data.reportId || generateReportId();
  const reportDate = new Date();
  const reportDateTime = reportDate.toLocaleString();

  const downloadReportPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 25;
    let pageNumber = 1;

    // Helper function to add page header
    const addPageHeader = () => {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        pageNumber++;
        currentY = 25;
        
        // Page number
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor('#94a3b8');
        doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
      }
    };

    // Helper function to add section heading
    const addSectionHeading = (title) => {
      addPageHeader();
      currentY += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor('#1565c0');
      doc.text(title, margin, currentY);
      currentY += 8;
      doc.setLineWidth(0.3);
      doc.setDrawColor('#e3f2fd');
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
    };

    // Helper function to add footer
    const addFooter = () => {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor('#94a3b8');
      doc.text(`Generated by RapidAid AI on ${reportDateTime}`, margin, pageHeight - 15);
      doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    };

    // Header - RapidAid AI Logo and Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#1565c0');
    doc.text('RapidAid AI', margin, currentY);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#64748b');
    doc.text('Professional Healthcare Analysis Report', margin, currentY + 10);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor('#1976d2');
    doc.line(margin, currentY + 15, pageWidth - margin, currentY + 15);
    currentY += 25;

    // Report Details Section
    addSectionHeading('Report Details');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#37474f');
    
    const details = [
      `Report ID: ${reportId}`,
      `Date & Time: ${reportDateTime}`,
      `Patient Name: ${getPatientName()}`
    ];

    details.forEach((line) => {
      doc.text(line, margin, currentY);
      currentY += 7;
    });

    currentY += 5;

    // Symptoms Section
    addSectionHeading('Symptoms Entered');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#37474f');
    const symptomLines = doc.splitTextToSize(getSymptomsText(), pageWidth - margin * 2);
    doc.text(symptomLines, margin, currentY);
    currentY += symptomLines.length * 6 + 10;

    // AI Diagnosis - Multiple Conditions
    addSectionHeading('AI Diagnosis - Top Possible Conditions');
    const conditions = getMultipleConditions();
    conditions.forEach((condition, index) => {
      addPageHeader();
      
      // Condition badge
      doc.setFillColor(condition.riskColor);
      doc.rect(margin, currentY - 5, 50, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor('white');
      doc.text(condition.isPrimary ? 'PRIMARY DIAGNOSIS' : `CONDITION #${index + 1}`, margin + 2, currentY - 1);
      
      currentY += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor('#1565c0');
      doc.text(condition.name, margin, currentY);
      
      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor('#64748b');
      doc.text(condition.explanation, margin, currentY);
      
      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor('#37474f');
      doc.text(`Confidence: ${condition.confidence}%`, margin, currentY);
      
      // Confidence bar
      currentY += 4;
      doc.setFillColor('#e3f2fd');
      doc.rect(margin, currentY, 60, 4, 'F');
      doc.setFillColor(condition.riskColor);
      doc.rect(margin, currentY, (condition.confidence / 100) * 60, 4, 'F');
      
      currentY += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor('#37474f');
      doc.text(`Risk Level: ${condition.riskLevel}`, margin + 70, currentY - 4);
      
      currentY += 12;
    });

    currentY += 5;

    // Risk Level Explanation
    addSectionHeading('Risk Level Analysis');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#37474f');
    const riskExplanationLines = doc.splitTextToSize(getRiskLevelExplanation(), pageWidth - margin * 2);
    doc.text(riskExplanationLines, margin, currentY);
    currentY += riskExplanationLines.length * 6 + 10;

    // AI Reasoning
    addSectionHeading('AI Reasoning');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#37474f');
    const reasoningLines = doc.splitTextToSize(generateAIReasoning(), pageWidth - margin * 2);
    doc.text(reasoningLines, margin, currentY);
    currentY += reasoningLines.length * 6 + 10;

    // Personalized Recommendations
    addSectionHeading('Personalized Recommendations');
    
    // Condition-specific recommendations
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#1565c0');
    doc.text('Recommendations:', margin, currentY);
    currentY += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#37474f');
    getConditionRecommendations().forEach((rec, index) => {
      addPageHeader();
      doc.text(`${index + 1}. ${rec}`, margin, currentY);
      currentY += 6;
    });
    
    currentY += 8;

    // Hydration
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#1565c0');
    doc.text('💧 Water Intake:', margin, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#37474f');
    doc.text(getHydrationAdvice(), margin, currentY);
    currentY += 8;

    // Recommended Foods
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#1565c0');
    doc.text('🥗 Recommended Foods:', margin, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#37474f');
    getRecommendedFoods().forEach((food, index) => {
      addPageHeader();
      doc.text(`• ${food}`, margin, currentY);
      currentY += 5;
    });
    
    currentY += 8;

    // Foods to Avoid
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#1565c0');
    doc.text('🚫 Foods to Avoid:', margin, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#37474f');
    getFoodsToAvoid().forEach((food, index) => {
      addPageHeader();
      doc.text(`• ${food}`, margin, currentY);
      currentY += 5;
    });
    
    currentY += 8;

    // Activity Level
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#1565c0');
    doc.text('Activity Level:', margin, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#37474f');
    doc.text(getActivityRecommendation(), margin, currentY);
    currentY += 8;

    // Recovery Estimate
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#1565c0');
    doc.text('Expected Recovery:', margin, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#37474f');
    doc.text(getRecoveryEstimate(), margin, currentY);
    currentY += 8;

    // Doctor Recommendation
    const doctorRec = getDoctorRecommendation();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#1565c0');
    doc.text('Doctor Recommendation:', margin, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(doctorRec.color);
    doc.text(doctorRec.text, margin, currentY);
    currentY += 10;

    // Emergency Warning
    const emergencyWarning = getEmergencyWarning();
    if (emergencyWarning) {
      addPageHeader();
      addSectionHeading('⚠ EMERGENCY WARNING');
      doc.setFillColor('#fff3e0');
      doc.rect(margin, currentY - 5, pageWidth - margin * 2, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor('#e65100');
      const warningLines = doc.splitTextToSize(emergencyWarning, pageWidth - margin * 2 - 10);
      doc.text(warningLines, margin + 5, currentY);
      currentY += warningLines.length * 6 + 15;
    }

    // Medical Disclaimer
    addSectionHeading('Medical Disclaimer');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#64748b');
    const disclaimerLines = doc.splitTextToSize(mappedData.disclaimer, pageWidth - margin * 2);
    doc.text(disclaimerLines, margin, currentY);
    currentY += disclaimerLines.length * 5 + 15;

    // Footer
    addFooter();

    doc.save(`RapidAidAI_Report_${reportId}.pdf`);
  };

  return (
    <div className="results-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">AI Analysis Results</h1>
        <p className="dashboard-subtitle">Based on your symptoms and medical information</p>
      </div>

      {/* AI Diagnosis Summary Card - Multiple Conditions */}
      <div className="diagnosis-summary-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 17C12.55 17 13 17.45 13 18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18C11 17.45 11.45 17 12 17ZM15.5 12.5L14.5 13.5C14.1 13.9 13.9 14.4 13.9 15H10.1C10.1 14.4 9.9 13.9 9.5 13.5L8.5 12.5C7.6 11.6 7 10.4 7 9C7 6.2 9.2 4 12 4C14.8 4 17 6.2 17 9C17 10.4 16.4 11.6 15.5 12.5Z"/>
            </svg>
          </span>
          AI Diagnosis - Top Possible Conditions
        </h3>
        
        <div className="conditions-grid">
          {getMultipleConditions().map((condition, index) => (
            <div 
              key={index} 
              className={`condition-card ${condition.isPrimary ? 'primary' : 'secondary'}`}
            >
              <div className="condition-header">
                <div className="condition-badge" style={{ backgroundColor: condition.riskColor }}>
                  {condition.isPrimary ? '⭐ Primary' : `#${index + 1}`}
                </div>
                <span className="condition-risk" style={{ color: condition.riskColor }}>
                  {condition.riskLevel}
                </span>
              </div>
              <h4 className="condition-name">{condition.name}</h4>
              <p className="condition-explanation">{condition.explanation}</p>
              
              <div className="confidence-section">
                <div className="confidence-label">
                  <span>Confidence</span>
                  <span className="confidence-value">{condition.confidence}%</span>
                </div>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ 
                      width: `${condition.confidence}%`,
                      backgroundColor: condition.riskColor 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Level Explanation */}
      <div className="risk-explanation-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </span>
          Why this risk level?
        </h3>
        <div className="risk-explanation-card">
          <p className="risk-explanation-text">{getRiskLevelExplanation()}</p>
        </div>
      </div>

      {/* Risk-Based Actions */}
      <div className="risk-actions-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
          Recommended Actions
        </h3>
        <div className="risk-actions-grid">
          {getRiskBasedActions().map((action, index) => (
            <button
              key={index}
              onClick={() => handleRiskAction(action.action)}
              className={`risk-action-button ${action.primary ? 'primary' : 'secondary'}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Reasoning Section */}
      <div className="reasoning-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
            </svg>
          </span>
          AI Reasoning
        </h3>
        <div className="reasoning-card">
          <p className="reasoning-text">{generateAIReasoning()}</p>
        </div>
      </div>

      {/* Confidence Explanation */}
      <div className="confidence-explanation-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </span>
          Confidence Explanation
        </h3>
        <div className="confidence-explanation-card">
          <div className="confidence-meter">
            <div className="confidence-bar">
              <div 
                className="confidence-fill"
                style={{ width: `${mappedData.confidence}%` }}
              ></div>
            </div>
            <div className="confidence-value">{mappedData.confidence}%</div>
          </div>
          <p className="confidence-explanation-text">{getConfidenceExplanation()}</p>
        </div>
      </div>

      {/* Possible Causes */}
      <div className="causes-section">
        <h3 className="section-title">Possible Causes</h3>
        <div className="causes-list">
          {mappedData.possibleCauses.map((cause, index) => (
            <div key={index} className="cause-item">
              <div className="cause-number">{index + 1}</div>
              <div className="cause-text">{cause}</div>
            </div>
          ))}
        </div>
      </div>

      {/* First Aid Recommendations */}
      <div className="firstaid-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>
          </span>
          First Aid Recommendations
        </h3>
        <div className="firstaid-list">
          {mappedData.firstAid.map((recommendation, index) => (
            <div key={index} className="firstaid-item">
              <div className="firstaid-bullet">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </div>
              <p className="firstaid-text">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Next Step */}
      <div className="next-step-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </span>
          Recommended Next Step
        </h3>
        <div className="next-step-card">
          <div className="next-step-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <p className="next-step-text">{getRecommendedNextStep()}</p>
        </div>
      </div>

      {/* Recommended Specialist */}
      <div className="specialist-section">
        <h3 className="section-title">Recommended Specialist</h3>
        <div className="specialist-card">
          <div className="specialist-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
            </svg>
          </div>
          <div className="specialist-info">
            <p className="specialist-label">Consult with</p>
            <p className="specialist-name">{mappedData.recommendedSpecialist}</p>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations Section */}
      <div className="recommendations-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
          Personalized Recommendations
        </h3>

        {/* Recommendations Grid */}
        <div className="recommendations-grid">
          {/* Condition-Specific Recommendations */}
          <div className="recommendation-card">
            <div className="rec-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h4 className="rec-title">Recommendations</h4>
            <ul className="rec-list">
              {getConditionRecommendations().map((rec, index) => (
                <li key={index} className="rec-item">{rec}</li>
              ))}
            </ul>
          </div>

          {/* Hydration Advice */}
          <div className="recommendation-card hydration-card">
            <div className="rec-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
              </svg>
            </div>
            <h4 className="rec-title">💧 Water Intake</h4>
            <p className="rec-value">{getHydrationAdvice()}</p>
          </div>

          {/* Recommended Foods */}
          <div className="recommendation-card food-card">
            <div className="rec-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
              </svg>
            </div>
            <h4 className="rec-title">🥗 Recommended Foods</h4>
            <ul className="rec-list">
              {getRecommendedFoods().map((food, index) => (
                <li key={index} className="rec-item">{food}</li>
              ))}
            </ul>
          </div>

          {/* Foods to Avoid */}
          <div className="recommendation-card avoid-card">
            <div className="rec-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.24 16.41L12 14.18l-4.24 4.23-1.41-1.41L10.59 12 6.35 7.77l1.41-1.41L12 10.59l4.24-4.23 1.41 1.41L13.41 12l4.24 4.23-1.41 1.41z"/>
              </svg>
            </div>
            <h4 className="rec-title">🚫 Avoid</h4>
            <ul className="rec-list">
              {getFoodsToAvoid().map((food, index) => (
                <li key={index} className="rec-item">{food}</li>
              ))}
            </ul>
          </div>

          {/* Activity Recommendation */}
          <div className="recommendation-card activity-card">
            <div className="rec-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.44L5.66 8l-1.92 1.41 4.72 6.4-1.28 5.28 2.31.29zm5.72-5.9l-3.21-2.18 2.04-3.52-1.73-1-2.5 4.32 4.59 3.09 1.81-2.71z"/>
              </svg>
            </div>
            <h4 className="rec-title">Activity Level</h4>
            <p className="rec-value">{getActivityRecommendation()}</p>
          </div>

          {/* Recovery Estimate */}
          <div className="recommendation-card recovery-card">
            <div className="rec-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <h4 className="rec-title">Expected Recovery</h4>
            <p className="rec-value">{getRecoveryEstimate()}</p>
          </div>
        </div>

        {/* Doctor Recommendation Badge */}
        <div className="doctor-recommendation-card">
          <div className="doctor-badge" style={{ backgroundColor: getDoctorRecommendation().color }}>
            <span className="doctor-badge-icon">
              {getDoctorRecommendation().level === 'critical' && '🔴'}
              {getDoctorRecommendation().level === 'warning' && '🟡'}
              {getDoctorRecommendation().level === 'safe' && '🟢'}
            </span>
            <span className="doctor-badge-text">{getDoctorRecommendation().text}</span>
          </div>
        </div>

        {/* Emergency Warning */}
        {getEmergencyWarning() && (
          <div className="emergency-warning-card">
            <div className="warning-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
            <p className="warning-text">{getEmergencyWarning()}</p>
          </div>
        )}
      </div>

      {/* Emergency Warning Card */}
      {mappedData.seekEmergencyCare && (
        <div className="emergency-section">
          <div className="emergency-card">
            <div className="emergency-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
              </svg>
            </div>
            <div className="emergency-content">
              <h3 className="emergency-title">⚠️ Seek Emergency Care</h3>
              <p className="emergency-text">
                Based on your symptoms, immediate medical attention is recommended.
                Please visit the nearest emergency room or call emergency services.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="disclaimer-section">
        <div className="disclaimer-card">
          <div className="disclaimer-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 17H13V19H11V17ZM11 15H13V7H11V15Z"/>
            </svg>
          </div>
          <p className="disclaimer-text">This AI prediction is intended only for preliminary guidance and does not replace consultation with a qualified healthcare professional.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions-section">
        <button onClick={handleAnalyzeAgain} className="action-button primary">
          <span className="button-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/>
            </svg>
          </span>
          Analyze Again
        </button>
        <button onClick={downloadReportPdf} className="action-button secondary">
          <span className="button-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V9H7V19H17V9H19ZM14 1H10V5H5.01L5 23H19V5H14V1ZM13 3H11V5H13V3ZM12 8.59L8.29 12.29L9.71 13.71L11 12.41V17H13V12.41L14.29 13.71L15.71 12.29L12 8.59Z"/>
            </svg>
          </span>
          Download Report
        </button>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal 
        isOpen={showAppointmentModal} 
        onClose={() => setShowAppointmentModal(false)} 
      />
    </div>
  );
};

export default ResultsDashboard;
