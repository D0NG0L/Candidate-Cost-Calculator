export function initCalculator() {
  // Prevent double-initialization (React dev mode can mount twice)
  if (window.__AGAD_CALC_INITIALIZED__) return;
  window.__AGAD_CALC_INITIALIZED__ = true;

  // Used by initBenefitsChart() (ES modules are strict; avoid implicit globals)
  let benefitsChart;

// Constants
  const WORKING_DAYS_PER_YEAR = 210;
  const MEAL_VOUCHER_EUR = 8; // fixed amount per working day
  // ===== Constants (readability) =====
  const SALARY_MONTHS_ANNUAL = 13.92;
  const SALARY_MONTHS_NO_HOLIDAY = 13;
  const DOUBLE_HOLIDAY_RATE = 0.92;
  const SOCIAL_CONTRIBUTION_MULTIPLIER = 1.2553;
  const DAYS_IN_YEAR_FOR_DAILY_RATE = 200;
  const PAYROLLING_MARGIN_ANNUAL_EUR = 24000; // fixed payrolling margin per year
  const ECO_VOUCHER_ANNUAL_EUR = 250;
  const HOSPITALIZATION_MONTHLY_EUR = 30;
  const ACCIDENT_INSURANCE_MONTHLY_EUR = 20;
  const HOME_OFFICE_MONTHLY_EUR = 148.73;
  const INTERNET_MAX_MONTHLY_EUR = 20;
  const PHONE_MAX_MONTHLY_EUR = 30;
  const REPRESENTATION_MAX_MONTHLY_EUR = 250;
  const PUBLIC_TRANSPORT_ASSUMED_MONTHLY_EUR = 50;
  const BICYCLE_ALLOWANCE_PER_KM_EUR = 0.27;
  const CAR_WASH_MAX_MONTHLY_EUR = 10;
  const PARKING_MONTHLY_EUR = 150;
  const TRAINING_BUDGET_ANNUAL_EUR = 500;
  const IT_EQUIPMENT_ONE_TIME_EUR = 500;
  const PRINTER_SCANNER_ONE_TIME_EUR = 50;
  const YEAR_END_BONUS_ANNUAL_EUR = 3948;
  const OFFICE_EQUIPMENT_MONTHLY_EUR = 20;
  const SALARY_MIN_BELGIAN = 2029.88;
  const SALARY_MIN_OTHER = 3703.44;

  // Global variables
  let candidateData = {
      experience: '',
      workModel: '',
      hybridOnsiteDays: 0,
      position: '',
      nationality: '',
      monthlySalary: 0,
      monthlyNetSalary: 0,
      carSelected: false,
      carCost: 0,
      mobilityBudget: 0,
      bicycleBudget: 0,
      benefits: {},
      targetMargin: 0
  };

  // Removed persistence of Monthly Net Salary to prevent pre-filling values on load

  // Phase navigation
  /**
   * Updates the phase UI indicators based on the current phase (1â€“5).
   * @param {number} phase
   */
  function updatePhaseIndicator(phase) {
      document.querySelectorAll('.phase-indicator').forEach((indicator, index) => {
          indicator.classList.remove('phase-active', 'phase-completed');
          if (index + 1 < phase) {
              indicator.classList.add('phase-completed');
          } else if (index + 1 === phase) {
              indicator.classList.add('phase-active');
          } else {
              indicator.classList.add('bg-gray-200', 'text-gray-600');
          }
      });
  }

  /**
   * Shows the requested application phase and updates indicator state.
   * @param {number} phaseNumber
   */
  function showPhase(phaseNumber) {
      document.querySelectorAll('[id^="phase"]').forEach(phase => phase.classList.add('hidden'));
      const target = document.getElementById(`phase${phaseNumber}`);
      target.classList.remove('hidden');
      updatePhaseIndicator(phaseNumber);
      if (phaseNumber === 5) {
          const finalResult = document.getElementById('final-result');
          if (finalResult) {
              finalResult.classList.remove('animate-fade-in-up');
              void finalResult.offsetWidth;
              finalResult.classList.add('animate-fade-in-up');
          }
      }
  }

  // Validation functions
  /**
   * Validates Phase 1 required selections and hybrid day dependency.
   * @returns {boolean}
   */
  function validatePhase1() {
      let isValid = true;
      const fields = ['experience', 'work-model', 'position', 'nationality'];
      
      fields.forEach(field => {
          const element = document.getElementById(field);
          const errorElement = document.getElementById(`${field}-error`);
          
          if (!element.value) {
              errorElement.classList.remove('hidden');
              isValid = false;
          } else {
              errorElement.classList.add('hidden');
          }
      });
      // Validate hybrid days if Hybrid is selected
      const workModelVal = document.getElementById('work-model').value;
      const hybridDaysEl = document.getElementById('hybrid-onsite-days');
      const hybridDaysError = document.getElementById('hybrid-days-error');
      if (workModelVal === 'Hybrid') {
          if (!hybridDaysEl.value) {
              hybridDaysError.classList.remove('hidden');
              isValid = false;
          } else {
              hybridDaysError.classList.add('hidden');
          }
      } else {
          hybridDaysError.classList.add('hidden');
      }
      
      return isValid;
  }

  // ===== Utilities =====
  /**
   * Parse a numeric input into a number, supporting EU/US formats (commas/dots/spaces).
   * @param {string|number} value
   * @returns {number} Parsed number or 0 when invalid
   */
  function parseNumericInput(value) {
      const str = (value || '').toString().trim().replace(/\s/g, '');
      const hasComma = str.indexOf(',') !== -1;
      const hasDot = str.indexOf('.') !== -1;
      let normalized = str;
      if (hasComma && hasDot) {
          // Assume comma is thousands separator, dot is decimal
          normalized = normalized.replace(/,/g, '');
      } else if (hasComma && !hasDot) {
          // Assume comma is decimal separator
          normalized = normalized.replace(/,/g, '.');
      }
      normalized = normalized.replace(/[^0-9.]/g, '');
      const n = parseFloat(normalized);
      return isNaN(n) ? 0 : n;
  }

  /**
   * Format a number as a euro string with two decimals (e.g., €1,234.00).
   * @param {number} value
   * @returns {string}
   */
  function formatEuro(value) {
      const n = Number(value) || 0;
      return `€${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Convenience: format a number as euro with no decimals (rounded).
   * @param {number} value
   * @returns {string}
   */
  function formatEuroRounded(value) {
      const n = Number(value) || 0;
      return `€${Math.round(n).toLocaleString()}`;
  }

  /**
   * Convenience: set element text by id if it exists.
   * @param {string} id
   * @param {string} text
   */
  function setTextContentById(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
  }

  /**
   * Validates Phase 2 salary inputs and minimum requirement.
   * @returns {boolean}
   */
  function validatePhase2() {
      const salary = parseNumericInput(document.getElementById('monthly-salary').value);
      const salaryError = document.getElementById('salary-error');
      const minimumError = document.getElementById('salary-minimum-error');
      
      if (!salary || salary <= 0) {
          salaryError.classList.remove('hidden');
          minimumError.classList.add('hidden');
          return false;
      }
      
      salaryError.classList.add('hidden');
      
      // Get salary requirements based on category
      const salaryRequirements = getSalaryRequirements();
      
      // Show guidance if under minimum, but do not block progression
      if (salary < salaryRequirements.minimum) {
          minimumError.textContent = `Minimum salary for this category: €${salaryRequirements.minimum.toLocaleString()}`;
          minimumError.classList.remove('hidden');
          return true;
      }
      
      // No maximum salary per current rules; skip maximum check
      minimumError.classList.add('hidden');
      return true;
  }

/**
 * Returns nationality-based minimum salary requirements.
 * @returns {{minimum:number, maximum:number}}
 */
function getSalaryRequirements() {
    const selectedNationality = document.getElementById('nationality')?.value || candidateData.nationality;
    const nationality = selectedNationality || '';
    // New rule: nationality-based minimums, no maximum
    const minimum = nationality === 'Belgian' ? SALARY_MIN_BELGIAN : SALARY_MIN_OTHER;
    const maximum = Infinity; // Explicitly no maximum
    return { minimum, maximum };
}

  /**
   * Validates Phase 4 margin selection (standard or manual â‰¥ 30,000).
   * @returns {boolean}
   */
  function validatePhase4() {
      const errorEl = document.getElementById('margin-error');
      const standardEl = document.getElementById('margin-standard');
      const payrollingEl = document.getElementById('margin-payrolling');
      const manualEl = document.getElementById('margin-manual');
      const manualInput = document.getElementById('manual-margin-amount');
      let valid = false;
      if (standardEl && standardEl.checked) {
          candidateData.targetMargin = 36000;
          valid = true;
      } else if (payrollingEl && payrollingEl.checked) {
          // Fixed €24,000 per year
          candidateData.targetMargin = PAYROLLING_MARGIN_ANNUAL_EUR;
          valid = true;
      } else if (manualEl && manualEl.checked) {
          const val = parseNumericInput(manualInput?.value || '');
          // No minimum; accept any numeric value (including 0)
          if (!isNaN(val)) {
              candidateData.targetMargin = val;
              valid = true;
          }
      }
      if (!valid) { if (errorEl) errorEl.classList.remove('hidden'); } else { if (errorEl) errorEl.classList.add('hidden'); }
      return valid;
  }

  // Update salary guidance
  /**
   * Updates salary guidance hint based on nationality selection.
   */
  function updateSalaryGuidance() {
    const salaryRequirements = getSalaryRequirements();
    const salaryGuidance = document.getElementById('salary-guidance');
    const salaryInput = document.getElementById('monthly-salary');
    const natVal = document.getElementById('nationality')?.value || candidateData.nationality;
    if (salaryInput && salaryRequirements && isFinite(salaryRequirements.minimum)) {
        salaryInput.min = String(salaryRequirements.minimum);
    }
    if (!salaryGuidance) return;
    // Show guidance once nationality is selected
    if (natVal) {
        const minText = salaryRequirements.minimum.toLocaleString();
        // Replace content to reflect minimum-only rule (no maximum)
        salaryGuidance.innerHTML = `Minimum salary requirement: €<span id="min-salary">${minText}</span> <span class="text-gray-500">(no maximum)</span>`;
        salaryGuidance.classList.remove('hidden');
    } else {
        salaryGuidance.classList.add('hidden');
    }
  }

  // Real-time validation for salary field
  /**
   * Real-time validator for the salary field, with inline error feedback.
   * @returns {boolean}
   */
  function validateSalaryFieldRealtime() {
      const input = document.getElementById('monthly-salary');
      const salaryError = document.getElementById('salary-error');
      const minimumError = document.getElementById('salary-minimum-error');
      if (!input) return true;
      const salary = parseNumericInput(input.value);
      const salaryRequirements = getSalaryRequirements();

      if (!salary || salary <= 0) {
          if (salaryError) salaryError.classList.remove('hidden');
          if (minimumError) minimumError.classList.add('hidden');
          input.classList.add('border-red-500');
          return false;
      }

      if (salaryError) salaryError.classList.add('hidden');

      if (salary < salaryRequirements.minimum) {
          if (minimumError) {
              minimumError.textContent = `Minimum salary for this category: €${salaryRequirements.minimum.toLocaleString()}`;
              minimumError.classList.remove('hidden');
          }
          input.classList.add('border-red-500');
          return false;
      }

      if (minimumError) minimumError.classList.add('hidden');
      input.classList.remove('border-red-500');
      return true;
  }

  // Hook up real-time salary validation and guidance updates
  /**
   * Wiring: attach real-time listeners for salary and nationality.
   */
  (function setupSalaryValidationRealtime(){
      const salaryInput = document.getElementById('monthly-salary');
      const nationalitySelect = document.getElementById('nationality');
      if (salaryInput) {
          salaryInput.addEventListener('input', validateSalaryFieldRealtime);
          salaryInput.addEventListener('blur', validateSalaryFieldRealtime);
      }
      if (nationalitySelect) {
          nationalitySelect.addEventListener('change', function(){
              candidateData.nationality = this.value;
              updateSalaryGuidance();
              validateSalaryFieldRealtime();
          });
      }
  })();

  // Normalize Monthly Net Salary input (supports comma decimals; fixes float artifacts)
  (function normalizeMonthlyNetSalaryInput(){
      const netInput = document.getElementById('monthly-net-salary');
      if (!netInput) return;
      const normalize = () => {
          // Robust parse supporting EU/US thousands & decimals
          const parseFlexible = (raw) => {
              if (raw == null) return NaN;
              let s = String(raw).trim().replace(/\s/g, '');
              const hasComma = s.indexOf(',') !== -1;
              const hasDot = s.indexOf('.') !== -1;
              if (hasComma && hasDot) {
                  // Decide decimal by last occurrence
                  if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
                      // EU: dot thousands, comma decimal
                      s = s.replace(/\./g, '').replace(/,/g, '.');
                  } else {
                      // US: comma thousands, dot decimal
                      s = s.replace(/,/g, '');
                  }
              } else if (hasComma && !hasDot) {
                  // Treat comma as decimal
                  s = s.replace(/,/g, '.');
              }
              s = s.replace(/[^0-9.\-]/g, '');
              const n = parseFloat(s);
              return isNaN(n) ? NaN : n;
          };
          const v = parseFlexible(netInput.value);
          if (isNaN(v) || v < 0) {
              netInput.value = '';
              return;
          }
          // Round to nearest euro using integer cents to avoid float artifacts
          const cents = Math.round((v + Number.EPSILON) * 100);
          const eurosRounded = Math.round(cents / 100);
          netInput.value = String(eurosRounded);
      };
      netInput.addEventListener('blur', normalize);
      netInput.addEventListener('change', normalize);
  })();

  // ===== Business Rules =====
  /**
   * Apply mutual exclusions and visibility rules across selections.
   * Keeps the benefits table in sync with visible options.
   */
  function applyBusinessRules() {
      const workModel = candidateData.workModel;
      const experience = candidateData.experience;
      
      // Get elements
      const carSection = document.getElementById('car-section');
      const mobilitySection = document.getElementById('mobility-section');
      const bicycleSection = document.getElementById('bicycle-section');
      const representationSection = document.getElementById('representation-section');
      const homeOfficeSection = document.getElementById('home-office-section');
      const officeEquipmentSection = document.getElementById('office-equipment-section');
      const mobilityBudgetOption = document.getElementById('mobility-budget-option');
      const companyCar = document.getElementById('company-car');
      const bicycleAllowance = document.getElementById('bicycle-allowance');
      const homeInternet = document.getElementById('home-internet');
      const homeInternetSection = document.getElementById('home-internet-section');
      const printerScannerSection = document.getElementById('printer-scanner-section');
      
      // Work model rules & defaults
      if (workModel === 'Remote') {
          // Disable Home Office Allowance for Remote per new rule
          homeOfficeSection.classList.add('disabled');
          officeEquipmentSection.classList.add('disabled');
          const ho = document.getElementById('home-office-allowance');
          if (ho && ho.checked) { ho.checked = false; ho.dispatchEvent(new Event('change')); }
          const officeEq = document.getElementById('office-equipment');
          if (officeEq && officeEq.checked) officeEq.checked = false;
          // Hide/disable related items
          homeInternet.checked = false; homeInternet.disabled = true; homeInternetSection.classList.add('hidden');
          printerScannerSection.classList.add('hidden');
          const ps = document.getElementById('printer-scanner');
          if (ps) ps.checked = false;
          // Hide representation for Remote
          representationSection.classList.add('hidden');
          document.getElementById('representation').checked = false;
      } else if (workModel === 'Hybrid') {
          // Suggest mixed benefits
              homeOfficeSection.classList.remove('disabled');
              officeEquipmentSection.classList.remove('disabled');
              homeInternet.disabled = false;
              document.getElementById('hybrid-days-container').classList.remove('hidden');
              if (candidateData.hybridOnsiteDays >= 1) {
              const ho = document.getElementById('home-office-allowance');
              if (ho && !ho.checked) { ho.checked = true; ho.dispatchEvent(new Event('change')); }
          }
          // Show representation for Hybrid
          representationSection.classList.remove('hidden');
      } else if (workModel === 'On-site') {
          // Enable Home Office Allowance for On-site per new rule
              homeOfficeSection.classList.remove('disabled');
              officeEquipmentSection.classList.remove('disabled');
              document.getElementById('home-office-allowance').checked = false;
              document.getElementById('office-equipment').checked = false;
          // Keep related sections hidden by default; they will show when Home Office is checked
          homeInternet.checked = false; homeInternetSection.classList.add('hidden');
              printerScannerSection.classList.add('hidden');
              document.getElementById('printer-scanner').checked = false;
              document.getElementById('hybrid-days-container').classList.add('hidden');
          // Show representation for On-site
          representationSection.classList.remove('hidden');
      }
      
      // Mobility budget availability (no conflicting selections)
      if (!companyCar.checked && !bicycleAllowance.checked) {
          mobilityBudgetOption.disabled = false;
          mobilitySection.classList.remove('disabled');
          mobilitySection.style.opacity = '1';
      }

      // Bicycle allowance availability (enable only when car & mobility budget are off)
      const mobilityBudgetChecked = document.getElementById('mobility-budget-option').checked;
      if (!companyCar.checked && !mobilityBudgetChecked) {
          bicycleAllowance.disabled = false;
          bicycleSection.classList.remove('disabled');
          bicycleSection.style.opacity = '1';
      } else if (!bicycleAllowance.checked) {
          bicycleAllowance.disabled = true;
          bicycleSection.classList.add('disabled');
          bicycleSection.style.opacity = '0.5';
          document.getElementById('bicycle-options').classList.add('hidden');
          const bicycleKmEl = document.getElementById('bicycle-km');
          if (bicycleKmEl) bicycleKmEl.value = '';
          const bicycleMonthlyEl = document.getElementById('bicycle-monthly-allowance');
          if (bicycleMonthlyEl) bicycleMonthlyEl.textContent = '0.00';
      }

      // Public transport dimmed/disabled for now (overrides mobility rule)
      const publicTransport = document.getElementById('public-transport');
      if (publicTransport) {
          publicTransport.checked = false;
          publicTransport.disabled = true;
          const section = document.getElementById('public-transport-section');
          if (section) section.classList.add('disabled');
      }

      // Car wash visible only with company car
      const carWashSection = document.getElementById('car-wash-section');
      if (carWashSection) {
          if (companyCar.checked) {
              carWashSection.classList.remove('hidden');
          } else {
              carWashSection.classList.add('hidden');
              document.getElementById('car-wash').checked = false;
              document.getElementById('car-wash-amount').value = '';
          }
      }
      // Parking subscription dimmed/disabled for now
      const parkingSectionEl = document.getElementById('parking-section');
      const parkingCheckbox = document.getElementById('parking-subscription');
      if (parkingSectionEl && parkingCheckbox) {
          parkingSectionEl.classList.add('disabled');
          parkingCheckbox.checked = false;
          parkingCheckbox.disabled = true;
      }
      // Keep chart in sync with representation visibility/selection
      try { updateBenefitsChart(); } catch (e) {}
  }

  // ===== Phase Data Collection =====
  /** Collect selections from Phase 1 into candidateData. */
  function collectPhase1Data() {
      candidateData.experience = document.getElementById('experience').value;
      candidateData.workModel = document.getElementById('work-model').value;
      candidateData.hybridOnsiteDays = parseInt(document.getElementById('hybrid-onsite-days').value || '0', 10);
      if (candidateData.workModel === 'Hybrid' && !candidateData.hybridOnsiteDays) {
          const hybridDaysEl = document.getElementById('hybrid-onsite-days');
          if (hybridDaysEl) hybridDaysEl.value = '1';
          candidateData.hybridOnsiteDays = 1;
      }
      candidateData.position = document.getElementById('position').value;
      candidateData.nationality = document.getElementById('nationality').value;
  }

  /** Collect inputs from Phase 2 into candidateData. */
  function collectPhase2Data() {
      candidateData.monthlySalary = parseNumericInput(document.getElementById('monthly-salary').value);
      candidateData.monthlyNetSalary = parseNumericInput(document.getElementById('monthly-net-salary')?.value || '');
      candidateData.carSelected = document.getElementById('company-car').checked;
      candidateData.carCost = parseFloat(document.getElementById('car-list').value) || 0;
      candidateData.mobilityBudget = parseFloat(document.getElementById('mobility-budget').value) || 0;
      const bicycleKm = parseNumericInput(document.getElementById('bicycle-km')?.value) || 0;
      candidateData.bicycleBudget = bicycleKm * BICYCLE_ALLOWANCE_PER_KM_EUR;
  }

  /** Collect selections from Phase 3 into candidateData. */
  function collectPhase3Data() {
      candidateData.benefits = {
          mealVoucher: document.getElementById('meal-voucher').checked,
          ecoChecque: document.getElementById('eco-cheque').checked,
          hospitalization: true,
          pensionPlan: document.getElementById('pension-plan').checked,
          pensionPercent: parseNumericInput(document.getElementById('pension-percent')?.value),
          accidentInsurance: true,
          representation: document.getElementById('representation').checked,
          representationAmount: Math.min(250, Math.max(0, parseNumericInput(document.getElementById('representation-amount').value || ''))),
          parkingSubscription: document.getElementById('parking-subscription').checked,
          garageAllowance: false,
          homeOfficeAllowance: document.getElementById('home-office-allowance').checked,
          officeEquipment: document.getElementById('office-equipment').checked,
          equipmentType: document.getElementById('equipment-type').value,
          homeInternet: document.getElementById('home-internet').checked,
          homeInternetAmount: Math.min(20, Math.max(0, parseNumericInput(document.getElementById('home-internet-amount')?.value || '0'))),
          phoneAllowance: document.getElementById('phone-allowance').checked,
          phoneAllowanceAmount: Math.min(30, Math.max(0, parseNumericInput(document.getElementById('phone-allowance-amount')?.value || '0'))),
          fuelCard: document.getElementById('fuel-card').checked,
          bicycleAllowance: document.getElementById('bicycle-allowance').checked,
          publicTransport: document.getElementById('public-transport').checked,
          carWash: document.getElementById('car-wash').checked,
          printerScanner: document.getElementById('printer-scanner').checked,
          yearEndBonus: document.getElementById('year-end-bonus').checked,
          trainingBudget: document.getElementById('training-budget').checked,
          itEquipment: document.getElementById('it-equipment').checked
      };
  }

  // ===== Phase Navigation =====
  /** Determine which phase is currently visible (1â€“5). */
  function getCurrentPhase() {
      const phases = Array.from(document.querySelectorAll('[id^="phase"]'));
      for (const el of phases) {
          if (!el.classList.contains('hidden')) {
              const id = el.id || '';
              const num = parseInt(id.replace('phase', ''), 10);
              return isNaN(num) ? 1 : num;
          }
      }
      return 1;
  }

  /**
   * Navigate to a target phase. Going back is always allowed; going forward validates prior phases
   * and stops at the earliest invalid phase.
   * @param {number} targetPhase 1â€“5
   */
  function navigateToPhase(targetPhase) {
      const current = getCurrentPhase();
      if (targetPhase <= current) {
          // Always allow going back
          showPhase(targetPhase);
          if (targetPhase === 2) { updateSalaryGuidance(); applyBusinessRules(); }
          if (targetPhase === 3) { applyBusinessRules(); try { updateBenefitsChart(); } catch (e) {} }
          return;
      }
      // Moving forward: validate sequentially
      collectPhase1Data();
      if (!validatePhase1()) { showPhase(1); return; }
      if (targetPhase === 2) { showPhase(2); updateSalaryGuidance(); applyBusinessRules(); return; }

      collectPhase2Data();
      if (!validatePhase2()) { showPhase(2); updateSalaryGuidance(); applyBusinessRules(); return; }
      if (targetPhase === 3) { showPhase(3); applyBusinessRules(); try { updateBenefitsChart(); } catch (e) {} return; }

      if (!validatePhase3()) { showPhase(3); applyBusinessRules(); return; }
      collectPhase3Data();
      if (targetPhase === 4) { showPhase(4); return; }

      // Phase 5 requires margin selection and calculation
      if (!validatePhase4()) { showPhase(4); return; }
      calculateOutput();
      showPhase(5);
  }

  // Make top phase indicators clickable + keyboard accessible
  (function setupClickablePhaseIndicators(){
      const indicators = document.querySelectorAll('.phase-indicator');
      if (!indicators || indicators.length === 0) return;
      indicators.forEach((el, idx) => {
          el.style.cursor = 'pointer';
          el.setAttribute('role', 'button');
          el.setAttribute('tabindex', '0');
          const target = idx + 1;
          el.addEventListener('click', function(){ navigateToPhase(target); });
          el.addEventListener('keydown', function(e){
              if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToPhase(target);
              }
          });
      });
  })();

  // Event listeners for Phase 1
  document.getElementById('continue-phase1').addEventListener('click', function() {
      collectPhase1Data();
      if (validatePhase1()) {
          showPhase(2);
          updateSalaryGuidance();
          applyBusinessRules();
      }
  });

  // Previous button for Phase 2
  document.getElementById('previous-phase2').addEventListener('click', function() {
      showPhase(1);
  });

  // Show hybrid days selector when Hybrid is chosen
  document.getElementById('work-model').addEventListener('change', function() {
      const container = document.getElementById('hybrid-days-container');
      if (this.value === 'Hybrid') {
          container.classList.remove('hidden');
      } else {
          container.classList.add('hidden');
      }
      // Representation visibility may change â†’ refresh chart
      try { updateBenefitsChart(); } catch (e) {}
  });

  // Event listeners for Phase 2 - Mutual Exclusions
  document.getElementById('company-car').addEventListener('change', function() {
      candidateData.carSelected = this.checked;
      const carOptions = document.getElementById('car-options');
      const mobilityBudgetOption = document.getElementById('mobility-budget-option');
      const mobilitySection = document.getElementById('mobility-section');
      const bicycleAllowance = document.getElementById('bicycle-allowance');
      const bicycleSection = document.getElementById('bicycle-section');
      const parkingSection = document.getElementById('parking-section');
      
      if (this.checked) {
          // Show car options and auto-select fuel card
          carOptions.classList.remove('hidden');
          document.getElementById('fuel-card').checked = true;
          
          // Enable parking (only available with company car)
          parkingSection.classList.remove('hidden');
          // Car wash available with company car
          document.getElementById('car-wash-section').classList.remove('hidden');
          
          // Disable mobility budget and bicycle allowance (mutual exclusion)
          mobilityBudgetOption.disabled = true;
          mobilityBudgetOption.checked = false;
          mobilitySection.classList.add('disabled');
          document.getElementById('mobility-options').classList.add('hidden');
          document.getElementById('mobility-budget').value = '';
          
          bicycleAllowance.disabled = true;
          bicycleAllowance.checked = false;
          bicycleSection.classList.add('disabled');
          document.getElementById('bicycle-options').classList.add('hidden');
          const bicycleKm1 = document.getElementById('bicycle-km');
          if (bicycleKm1) bicycleKm1.value = '';
          const bicycleMonthly1 = document.getElementById('bicycle-monthly-allowance');
          if (bicycleMonthly1) bicycleMonthly1.textContent = '0.00';
          
          // Visual feedback
          mobilitySection.style.opacity = '0.5';
          bicycleSection.style.opacity = '0.5';
      } else {
          // Hide car options and deselect fuel card
          carOptions.classList.add('hidden');
          document.getElementById('car-list').value = '';
          document.getElementById('fuel-card').checked = false;
          
          // Hide parking and garage (only available with company car)
          parkingSection.classList.add('hidden');
          document.getElementById('parking-subscription').checked = false;
          // Hide car wash
          document.getElementById('car-wash-section').classList.add('hidden');
          document.getElementById('car-wash').checked = false;
          
          // Re-enable mobility budget and bicycle
          mobilityBudgetOption.disabled = false;
          mobilitySection.classList.remove('disabled');
          mobilitySection.style.opacity = '1';
          
          bicycleAllowance.disabled = false;
          bicycleSection.classList.remove('disabled');
          bicycleSection.style.opacity = '1';
      }
  });

  document.getElementById('mobility-budget-option').addEventListener('change', function() {
      const mobilityOptions = document.getElementById('mobility-options');
      const companyCar = document.getElementById('company-car');
      const carSection = document.getElementById('car-section');
      const bicycleAllowance = document.getElementById('bicycle-allowance');
      const bicycleSection = document.getElementById('bicycle-section');
      
      if (this.checked) {
          // Show mobility options
          mobilityOptions.classList.remove('hidden');
          
          // Disable company car and bicycle allowance (mutual exclusion)
          companyCar.disabled = true;
          companyCar.checked = false;
          carSection.classList.add('disabled');
          document.getElementById('car-options').classList.add('hidden');
          document.getElementById('car-list').value = '';
          document.getElementById('fuel-card').checked = false;
          
          bicycleAllowance.disabled = true;
          bicycleAllowance.checked = false;
          bicycleSection.classList.add('disabled');
          document.getElementById('bicycle-options').classList.add('hidden');
          const bicycleKm2 = document.getElementById('bicycle-km');
          if (bicycleKm2) bicycleKm2.value = '';
          const bicycleMonthly2 = document.getElementById('bicycle-monthly-allowance');
          if (bicycleMonthly2) bicycleMonthly2.textContent = '0.00';
          
          // Hide parking and garage (only available with company car)
          document.getElementById('parking-section').classList.add('hidden');
          document.getElementById('parking-subscription').checked = false;
          // Disable public transport with mobility budget
          const publicTransport = document.getElementById('public-transport');
          if (publicTransport) {
              publicTransport.checked = false;
              publicTransport.disabled = true;
          }
          
          // Visual feedback
          carSection.style.opacity = '0.5';
          bicycleSection.style.opacity = '0.5';
      } else {
          // Hide mobility options
          mobilityOptions.classList.add('hidden');
          document.getElementById('mobility-budget').value = '';
          
          // Re-enable company car and bicycle allowance
          companyCar.disabled = false;
          carSection.classList.remove('disabled');
          carSection.style.opacity = '1';
          
          bicycleAllowance.disabled = false;
          bicycleSection.classList.remove('disabled');
          bicycleSection.style.opacity = '1';
          // Re-enable public transport
          const publicTransport = document.getElementById('public-transport');
          if (publicTransport) {
              publicTransport.disabled = false;
          }
      }
  });

  document.getElementById('bicycle-allowance').addEventListener('change', function() {
      const bicycleOptions = document.getElementById('bicycle-options');
      const mobilityBudgetOption = document.getElementById('mobility-budget-option');
      const mobilitySection = document.getElementById('mobility-section');
      const companyCar = document.getElementById('company-car');
      const carSection = document.getElementById('car-section');
      const bicycleKmEl = document.getElementById('bicycle-km');
      const bicycleMonthlyEl = document.getElementById('bicycle-monthly-allowance');
      
      if (this.checked) {
          // Show bicycle options
          bicycleOptions.classList.remove('hidden');
          
          // Disable mobility budget (mutual exclusion)
          mobilityBudgetOption.disabled = true;
          mobilityBudgetOption.checked = false;
          mobilitySection.classList.add('disabled');
          document.getElementById('mobility-options').classList.add('hidden');
          document.getElementById('mobility-budget').value = '';
          
          // Disable company car (mutual exclusion)
          companyCar.disabled = true;
          companyCar.checked = false;
          carSection.classList.add('disabled');
          document.getElementById('car-options').classList.add('hidden');
          document.getElementById('car-list').value = '';
          document.getElementById('fuel-card').checked = false;
          document.getElementById('parking-section').classList.add('hidden');
          document.getElementById('parking-subscription').checked = false;
          document.getElementById('car-wash-section').classList.add('hidden');
          document.getElementById('car-wash').checked = false;

          // Visual feedback
          mobilitySection.style.opacity = '0.5';
          carSection.style.opacity = '0.5';
          // Reset values
          if (bicycleKmEl) bicycleKmEl.value = '';
          if (bicycleMonthlyEl) bicycleMonthlyEl.textContent = '0.00';
      } else {
          // Hide bicycle options
          bicycleOptions.classList.add('hidden');
          if (bicycleKmEl) bicycleKmEl.value = '';
          if (bicycleMonthlyEl) bicycleMonthlyEl.textContent = '0.00';
          
          // Re-enable mobility budget and company car
          mobilityBudgetOption.disabled = false;
          mobilitySection.classList.remove('disabled');
          mobilitySection.style.opacity = '1';
          companyCar.disabled = false;
          carSection.classList.remove('disabled');
          carSection.style.opacity = '1';
      }
  });

  // Compute bicycle monthly allowance from km input at fixed €/km
  document.addEventListener('input', function(e) {
      if (e.target && e.target.id === 'bicycle-km') {
          const km = parseFloat(e.target.value) || 0;
          const monthly = km * BICYCLE_ALLOWANCE_PER_KM_EUR;
          const out = document.getElementById('bicycle-monthly-allowance');
          if (out) out.textContent = monthly.toFixed(2);
      }
  });

  document.getElementById('continue-phase2').addEventListener('click', function() {
      collectPhase2Data();
      if (validatePhase2()) {
          showPhase(3);
          applyBusinessRules();
          try { updateBenefitsChart(); } catch (e) {}
      }
  });

  // Previous button for Phase 3
  document.getElementById('previous-phase3').addEventListener('click', function() {
      showPhase(2);
  });

  // Event listeners for Phase 3
  // Gate internet/equipment/printer by Home Office Allowance
  document.getElementById('home-office-allowance').addEventListener('change', function() {
      const isChecked = this.checked;
      const internetSection = document.getElementById('home-internet-section');
      const officeSection = document.getElementById('office-equipment-section');
      const printerSection = document.getElementById('printer-scanner-section');
      if (isChecked) {
          internetSection.classList.remove('hidden');
          officeSection.classList.remove('hidden');
          printerSection.classList.remove('hidden');
      } else {
          internetSection.classList.add('hidden');
          officeSection.classList.add('hidden');
          printerSection.classList.add('hidden');
          document.getElementById('home-internet').checked = false;
          document.getElementById('office-equipment').checked = false;
          document.getElementById('printer-scanner').checked = false;
      }
  });

  // Smart validation for Phase 3 fields on continue
  /**
   * Validates optional inputs in Phase 3 when their toggles are active.
   * @returns {boolean}
   */
  function validatePhase3() {
      let ok = true;
      const show = (id, cond) => {
          const el = document.getElementById(id);
          if (!el) return;
          if (cond) el.classList.remove('hidden'); else el.classList.add('hidden');
      };
      // Meal vouchers: no input; default handled in calculation
      // No numeric input validation for eco cheque (fixed cap used)
      show('eco-cheque-amount-error', false);
      // Representation requires amount when checked (0â€“250)
      if (document.getElementById('representation').checked) {
          const raw = document.getElementById('representation-amount').value || '';
          const v = parseNumericInput(raw);
          const bad = !(raw.trim() !== '' && v >= 0 && v <= 250);
          show('representation-amount-error', bad);
          if (bad) ok = false;
      } else {
          show('representation-amount-error', false);
      }
      // Equipment requires type when checked
      if (document.getElementById('office-equipment').checked) {
          const v = document.getElementById('equipment-type').value;
          const bad = !(v === '500' || v === '20');
          show('equipment-type-error', bad);
          if (bad) ok = false;
      } else {
          show('equipment-type-error', false);
      }
      // Validate public transport amount if selected
      if (document.getElementById('public-transport').checked) {
          const v = parseNumericInput(document.getElementById('public-transport-amount').value || '');
          const bad = !(v > 0);
          show('public-transport-amount-error', bad);
          if (bad) ok = false;
      } else {
          show('public-transport-amount-error', false);
      }
      // Home internet requires amount when checked (required, 0â€“20)
      if (document.getElementById('home-internet').checked) {
          const raw = document.getElementById('home-internet-amount')?.value ?? '';
          const v = parseNumericInput(raw);
          const bad = !(raw.trim() !== '' && v >= 0 && v <= 20);
          show('home-internet-amount-error', bad);
          if (bad) ok = false;
      } else {
          show('home-internet-amount-error', false);
      }
      if (document.getElementById('car-wash').checked) {
          const v = parseNumericInput(document.getElementById('car-wash-amount').value || '');
          const badCW = !(v > 0 && v <= 10);
          show('car-wash-amount-error', badCW);
          if (badCW) ok = false;
      } else {
          show('car-wash-amount-error', false);
      }
      // Phone allowance requires amount when checked (required, 0â€“30)
      if (document.getElementById('phone-allowance').checked) {
          const raw = document.getElementById('phone-allowance-amount')?.value ?? '';
          const v = parseNumericInput(raw);
          const bad = !(raw.trim() !== '' && v >= 0 && v <= 30);
          show('phone-allowance-amount-error', bad);
          if (bad) ok = false;
      } else {
          show('phone-allowance-amount-error', false);
      }
      show('year-end-bonus-amount-error', false);
      show('training-budget-amount-error', false);
      show('it-equipment-amount-error', false);
      // Pension percent required 1-4% when pension plan checked
      if (document.getElementById('pension-plan').checked) {
          const raw = document.getElementById('pension-percent')?.value ?? '';
          const v = parseNumericInput(raw);
          const bad = !(v >= 1 && v <= 4);
          show('pension-percent-error', bad);
          if (bad) ok = false;
      } else {
          show('pension-percent-error', false);
      }
      return ok;
  }

  // Enable/disable related inputs when toggles change
  /**
   * Enables/disables companion inputs when option checkboxes toggle on/off.
   */
  function setupPhase3ToggleBindings() {
      const bindings = [
          {check: 'representation', inputIds: ['representation-amount']},
          {check: 'office-equipment', inputIds: ['equipment-type']},
          {check: 'home-internet', inputIds: ['home-internet-amount']},
          {check: 'public-transport', inputIds: ['public-transport-amount']},
          {check: 'car-wash', inputIds: ['car-wash-amount']},
          {check: 'printer-scanner', inputIds: ['printer-scanner-amount']},
          {check: 'phone-allowance', inputIds: ['phone-allowance-amount']},
          {check: 'it-equipment', inputIds: ['it-equipment-amount']}
      ];
      bindings.forEach(b => {
          const cb = document.getElementById(b.check);
          if (!cb) return;
          const update = () => {
              b.inputIds.forEach(id => {
                  const el = document.getElementById(id);
                  if (!el) return;
                  el.disabled = !cb.checked;
                  el.required = cb.checked;
                  // smart visibility: inputs appear only when toggle is checked
                  if (cb.checked) {
                      el.classList.remove('hidden');
                      try { el.focus(); } catch (e) {}
                  } else {
                      el.classList.add('hidden');
                  }
              });
          };
          cb.addEventListener('change', update);
          update();
      });
  }

  setupPhase3ToggleBindings();
  // Show/hide pension percentage input when pension plan is toggled
  (function() {
      const pensionCb = document.getElementById('pension-plan');
      const section = document.getElementById('pension-percent-section');
      if (!pensionCb || !section) return;
      const update = () => { if (pensionCb.checked) { section.classList.remove('hidden'); } else { section.classList.add('hidden'); } };
      pensionCb.addEventListener('change', update);
      update();
  })();

  // Show red min/max guidance when toggles are active
  /**
   * Shows min/max guidance hints only when related toggles are active.
   */
  function updateRangeHints() {
      const toggle = (checkId, hintId) => {
          const cb = document.getElementById(checkId);
          const hint = document.getElementById(hintId);
          if (!cb || !hint) return;
          if (cb.checked) hint.classList.remove('hidden'); else hint.classList.add('hidden');
      };
      // home-internet range hint removed
      toggle('public-transport', 'public-transport-range');
      toggle('car-wash', 'car-wash-range');
      toggle('printer-scanner', 'printer-scanner-range');
      toggle('year-end-bonus', 'year-end-bonus-range');
      toggle('training-budget', 'training-budget-range');
  }

  ['eco-cheque','home-internet','public-transport','car-wash','printer-scanner','year-end-bonus','training-budget'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', updateRangeHints);
  });
  updateRangeHints();
  document.getElementById('continue-phase3').addEventListener('click', function() {
      if (!validatePhase3()) {
          return;
      }
      collectPhase3Data();
      showPhase(4);
  });

  // Previous button for Phase 4
  document.getElementById('previous-phase4').addEventListener('click', function() {
      showPhase(3);
  });

  // Event listeners for Phase 4
  // Replaced by radio-based margin handlers below

  document.getElementById('calculate-output').addEventListener('click', function() {
      if (validatePhase4()) {
          calculateOutput();
          showPhase(5);
      }
  });

  // Previous button for Phase 5
  document.getElementById('previous-phase5').addEventListener('click', function() {
      showPhase(4);
  });

  // ===== Calculation =====
  /**
   * Perform the full cost breakdown and populate Phase 5 outputs.
   */
  function calculateOutput() {
      // Re-collect Phase 2 data to ensure we have the latest values (especially net salary)
      collectPhase2Data();
      const monthlyGross = candidateData.monthlySalary;
      // Ensure default pre-checked benefits are reflected even if Phase 3 wasn't resubmitted
      const mvChecked = document.getElementById('meal-voucher')?.checked === true;
      const ecoChecked = document.getElementById('eco-cheque')?.checked === true;
      if (!candidateData.benefits) candidateData.benefits = {};
      candidateData.benefits.mealVoucher = mvChecked;
      candidateData.benefits.ecoChecque = ecoChecked;
      candidateData.benefits.hospitalization = true;
      candidateData.benefits.accidentInsurance = true;
      
      // AGAD Calculations
      const doubleHolidayPay = monthlyGross * DOUBLE_HOLIDAY_RATE;
      const annualGrossSalary = monthlyGross * SALARY_MONTHS_ANNUAL;
      const annualGrossNoHoliday = monthlyGross * SALARY_MONTHS_NO_HOLIDAY;
      // Backend equation alignment:
      // 1) Social contribution = Monthly gross * 13 * 1.2553
    //   2) Salary total cost per year = Social contribution + Double holiday pay
      const socialContribution = annualGrossNoHoliday * SOCIAL_CONTRIBUTION_MULTIPLIER;
      const totalSalaryCost = socialContribution + doubleHolidayPay;
      
      // Benefits costs
      const mealVoucherAnnual = candidateData.benefits.mealVoucher ? WORKING_DAYS_PER_YEAR * MEAL_VOUCHER_EUR : 0;
      let benefitsCost = 0;
      let pensionAnnual = 0;
      let pensionPct = 0;
      // Meal vouchers: included in employer annual cost as 210 Ã— €8 when selected
      // ECO voucher: fixed annual amount when selected (displayed annually only)
      if (candidateData.benefits.ecoChecque) {
          benefitsCost += ECO_VOUCHER_ANNUAL_EUR; // annual
      }
      benefitsCost += mealVoucherAnnual;
      if (candidateData.benefits.hospitalization) benefitsCost += HOSPITALIZATION_MONTHLY_EUR * 12; // monthly
      if (candidateData.benefits.pensionPlan) {
          const rawPct = candidateData.benefits.pensionPercent;
          const pct = isNaN(rawPct) ? 1 : Math.max(1, Math.min(4, rawPct));
          pensionPct = pct;
          pensionAnnual = (pct / 100) * annualGrossSalary;
          benefitsCost += pensionAnnual;
      }
      if (candidateData.benefits.accidentInsurance) benefitsCost += ACCIDENT_INSURANCE_MONTHLY_EUR * 12;
      if (candidateData.benefits.representation) {
          const rep = Math.min(REPRESENTATION_MAX_MONTHLY_EUR, Math.max(0, candidateData.benefits.representationAmount || 0));
          benefitsCost += rep * 12;
      }
      if (candidateData.benefits.parkingSubscription) benefitsCost += PARKING_MONTHLY_EUR * 12;
      // Garage allowance removed
      if (candidateData.benefits.homeOfficeAllowance) benefitsCost += HOME_OFFICE_MONTHLY_EUR * 12;
      // Internet & phone amounts from user (capped)
      const internetMonthlyAmount = candidateData.benefits.homeInternet
          ? Math.min(INTERNET_MAX_MONTHLY_EUR, Math.max(0, candidateData.benefits.homeInternetAmount || 0))
          : 0;
      if (internetMonthlyAmount > 0) benefitsCost += internetMonthlyAmount * 12;
      const phoneMonthlyAmount = candidateData.benefits.phoneAllowance
          ? Math.min(PHONE_MAX_MONTHLY_EUR, Math.max(0, candidateData.benefits.phoneAllowanceAmount || 0))
          : 0;
      if (phoneMonthlyAmount > 0) benefitsCost += phoneMonthlyAmount * 12;
      if (candidateData.benefits.bicycleAllowance) benefitsCost += candidateData.bicycleBudget * 12; // Monthly € from km * const
      // Use fixed assumptions in absence of amounts
      if (candidateData.benefits.publicTransport) benefitsCost += PUBLIC_TRANSPORT_ASSUMED_MONTHLY_EUR * 12;
      if (candidateData.benefits.carWash) {
          const cw = Math.min(CAR_WASH_MAX_MONTHLY_EUR, Math.max(0, parseNumericInput(document.getElementById('car-wash-amount')?.value || '0') || 0));
          benefitsCost += cw * 12;
      }
      if (candidateData.benefits.printerScanner) benefitsCost += PRINTER_SCANNER_ONE_TIME_EUR; // one-time
      if (candidateData.benefits.yearEndBonus) benefitsCost += YEAR_END_BONUS_ANNUAL_EUR; // capped per year
      if (candidateData.benefits.trainingBudget) benefitsCost += TRAINING_BUDGET_ANNUAL_EUR; // assumed annual training
      if (candidateData.benefits.itEquipment) benefitsCost += IT_EQUIPMENT_ONE_TIME_EUR; // one-time
      
      // Office equipment cost
      if (candidateData.benefits.officeEquipment) {
          if (candidateData.benefits.equipmentType === '500') {
              benefitsCost += 500; // One-time cost
          } else if (candidateData.benefits.equipmentType === '20') {
              benefitsCost += 20 * 12; // Monthly cost
          }
      }
      
      // Add car or mobility budget cost
      let mobilityCost = 0;
      if (candidateData.carSelected && candidateData.carCost) {
          mobilityCost = candidateData.carCost;
      } else if (candidateData.mobilityBudget) {
          mobilityCost = candidateData.mobilityBudget * 12;
      }
      // Capture selected car label for display in Candidate Offer
      (function captureCarLabel(){
          let label = '';
          const carListEl = document.getElementById('car-list');
          if (candidateData.carSelected && carListEl && carListEl.selectedIndex > 0) {
              label = carListEl.options[carListEl.selectedIndex].text || '';
              const sepIdx = label.indexOf(' - ');
              if (sepIdx > -1) label = label.substring(0, sepIdx);
          }
          candidateData.carLabel = label;
      })();
      
      const totalCostPerYear = totalSalaryCost + benefitsCost + mobilityCost;
      const annualMargin = candidateData.targetMargin || 0; // € per year
      const finalRate = (totalCostPerYear + annualMargin) / DAYS_IN_YEAR_FOR_DAILY_RATE; // includes margin

      // Selected package label (for displays)
      let selectedPackage = '-';
      const stdPkg = document.getElementById('margin-standard');
      const payPkg = document.getElementById('margin-payrolling');
      const manPkg = document.getElementById('margin-manual');
      if (stdPkg && stdPkg.checked) { selectedPackage = 'Standard (€36,000)'; }
      else if (payPkg && payPkg.checked) { selectedPackage = 'Payrolling (€24,000/year)'; }
      else if (manPkg && manPkg.checked) { selectedPackage = `Manual (€${Math.round(candidateData.targetMargin || 0).toLocaleString()})`; }

      // Net salary base (manual only; no estimation fallback)
      // Read directly from input field to ensure we have the latest value
      // Also update candidateData to keep it in sync
      const netSalaryInputEl = document.getElementById('monthly-net-salary');
      const netSalaryRaw = netSalaryInputEl ? String(netSalaryInputEl.value || '').trim() : '';
      const netSalaryInputValue = netSalaryRaw !== '' ? parseNumericInput(netSalaryRaw) : 0;
      const hasManualNetSalary = netSalaryRaw !== '' && netSalaryInputValue > 0;

      // If the user cleared the field, also clear stored value to avoid showing stale values.
      if (netSalaryRaw === '') {
          candidateData.monthlyNetSalary = 0;
      }

      const monthlyNetEstimated = hasManualNetSalary ? netSalaryInputValue : 0;

      // Update candidateData with the latest value for consistency
      if (hasManualNetSalary) {
          candidateData.monthlyNetSalary = monthlyNetEstimated;
      }
      const netSalaryExcludingBenefits = monthlyNetEstimated;
      // Monthly net benefits sum
      const mealVoucherMonthly = candidateData.benefits.mealVoucher ? (WORKING_DAYS_PER_YEAR * MEAL_VOUCHER_EUR) / 12 : 0; // monthly
      const ecoVoucherMonthly = candidateData.benefits.ecoChecque ? (ECO_VOUCHER_ANNUAL_EUR / 12) : 0;
      const homeOfficeMonthly = candidateData.benefits.homeOfficeAllowance ? HOME_OFFICE_MONTHLY_EUR : 0;
      const internetMonthly = candidateData.benefits.homeInternet ? Math.min(INTERNET_MAX_MONTHLY_EUR, Math.max(0, candidateData.benefits.homeInternetAmount || 0)) : 0;
      const phoneMonthly = candidateData.benefits.phoneAllowance ? Math.min(PHONE_MAX_MONTHLY_EUR, Math.max(0, candidateData.benefits.phoneAllowanceAmount || 0)) : 0;
      const hospitalizationMonthly = candidateData.benefits.hospitalization ? HOSPITALIZATION_MONTHLY_EUR : 0;
      const pensionMonthly = candidateData.benefits.pensionPlan ? ((pensionPct / 100) * annualGrossSalary) / 12 : 0;
      const accidentMonthly = candidateData.benefits.accidentInsurance ? ACCIDENT_INSURANCE_MONTHLY_EUR : 0;
      const representationMonthly = candidateData.benefits.representation ? Math.min(REPRESENTATION_MAX_MONTHLY_EUR, Math.max(0, (candidateData.benefits.representationAmount || REPRESENTATION_MAX_MONTHLY_EUR))) : 0;
      const publicTransportMonthly = candidateData.benefits.publicTransport ? (parseNumericInput(document.getElementById('public-transport-amount')?.value || '0') || 0) : 0;
      const bicycleMonthly = candidateData.benefits.bicycleAllowance ? (candidateData.bicycleBudget || 0) : 0;
      const carWashMonthly = candidateData.benefits.carWash ? Math.min(CAR_WASH_MAX_MONTHLY_EUR, Math.max(0, (parseNumericInput(document.getElementById('car-wash-amount')?.value || '0') || 0))) : 0;
      const yearEndBonusMonthly = candidateData.benefits.yearEndBonus ? (YEAR_END_BONUS_ANNUAL_EUR / 12) : 0;
      const parkingMonthly = candidateData.benefits.parkingSubscription ? PARKING_MONTHLY_EUR : 0;
      const officeEquipmentMonthly = (candidateData.benefits.officeEquipment && candidateData.benefits.equipmentType === '20') ? OFFICE_EQUIPMENT_MONTHLY_EUR : 0;
      const netBenefitsMonthly = mealVoucherMonthly + ecoVoucherMonthly + hospitalizationMonthly + pensionMonthly + accidentMonthly + homeOfficeMonthly + internetMonthly + phoneMonthly + representationMonthly + publicTransportMonthly + bicycleMonthly + carWashMonthly + yearEndBonusMonthly + parkingMonthly + officeEquipmentMonthly;
      // For candidate net salary calculation, exclude these five from the additive sum:
      // Eco voucher, Hospitalization, Meal voucher, Pension plan, Accident insurance
      const netBenefitsMonthlyForNet = homeOfficeMonthly + internetMonthly + phoneMonthly + representationMonthly + publicTransportMonthly + bicycleMonthly + carWashMonthly + yearEndBonusMonthly + parkingMonthly + officeEquipmentMonthly;
      const netBenefits = netBenefitsMonthlyForNet;
      const commuteMonthly = publicTransportMonthly + bicycleMonthly + parkingMonthly + carWashMonthly;
      
      // Hide/show benefits-related rows in final result when benefits exist
      const anyNetBenefits = netBenefitsMonthly > 0;
      const anyBenefitsForDisplay = !!(
          candidateData.benefits.mealVoucher ||
          candidateData.benefits.ecoChecque ||
          candidateData.benefits.hospitalization ||
          candidateData.benefits.accidentInsurance ||
          candidateData.benefits.homeOfficeAllowance ||
          internetMonthly > 0 || phoneMonthly > 0 || representationMonthly > 0 ||
          publicTransportMonthly > 0 || bicycleMonthly > 0 || carWashMonthly > 0 ||
          yearEndBonusMonthly > 0 || parkingMonthly > 0 || officeEquipmentMonthly > 0 ||
          (candidateData.benefits.pensionPlan && pensionMonthly > 0) ||
          candidateData.carSelected
      );
      const benefitsSelectedRow = null;
      const benefitsSummaryRow = document.getElementById('benefits-summary')?.closest('tr');
      const netInclRow = document.getElementById('net-incl-benefits')?.closest('tr');
      const netBenefitsMonthlyRow = document.getElementById('net-benefits-per-month')?.closest('tr');
      const selectedBenefitsSection = document.getElementById('selected-benefits-section');
      if (selectedBenefitsSection) {
          // Show section on page only when there are benefits to display; otherwise hide
          if (anyBenefitsForDisplay) selectedBenefitsSection.classList.remove('hidden');
          else selectedBenefitsSection.classList.add('hidden');
      }
      // Always show net-incl-benefits row (even if 0) - it should always be visible
      if (netInclRow) netInclRow.classList.remove('hidden');
      
      if (anyNetBenefits) {
          if (benefitsSelectedRow) benefitsSelectedRow.classList.remove('hidden');
          if (benefitsSummaryRow) benefitsSummaryRow.classList.remove('hidden');
          if (netBenefitsMonthlyRow) netBenefitsMonthlyRow.classList.remove('hidden');
      } else {
          if (benefitsSelectedRow) benefitsSelectedRow.classList.add('hidden');
          if (benefitsSummaryRow) benefitsSummaryRow.classList.add('hidden');
          if (netBenefitsMonthlyRow) netBenefitsMonthlyRow.classList.add('hidden');
      }

      // Update display
      setTextContentById('monthly-gross', formatEuroRounded(monthlyGross));
      // Requested Daily Rate removed from Candidate Offer. See Sales Team section.
      setTextContentById('annual-gross', formatEuroRounded(annualGrossSalary));
      setTextContentById('candidate-double-holiday', formatEuroRounded(doubleHolidayPay));
      setTextContentById('thirteenth-month', formatEuroRounded(monthlyGross));
      // Candidate Offer: show "Net Per Month (Excl. Benefits)" only when manually provided
      const netExclBenefitsRow = document.getElementById('net-excl-benefits')?.closest('tr');
      if (netExclBenefitsRow) {
          if (hasManualNetSalary) netExclBenefitsRow.classList.remove('hidden');
          else netExclBenefitsRow.classList.add('hidden');
      }
      setTextContentById('net-excl-benefits', hasManualNetSalary ? formatEuroRounded(monthlyNetEstimated) : '€0');
      // Precompute mobility budget monthly (only when mobility budget selected and no car)
      const mobilityBudgetMonthly = (!!candidateData.mobilityBudget && !candidateData.carSelected) ? candidateData.mobilityBudget : 0;
      // Include Mobility Budget in net monthly income (including Extra Benefits)
      setTextContentById('net-incl-benefits', formatEuroRounded((monthlyNetEstimated + netBenefitsMonthlyForNet) + mobilityBudgetMonthly));
      // Manual net row in Candidate Offer (show only when provided)
      const manualNetRow = document.getElementById('manual-net-row');
      const manualNetEl = document.getElementById('manual-monthly-net');
      if (manualNetRow && manualNetEl) {
          if (candidateData.monthlyNetSalary && candidateData.monthlyNetSalary > 0) {
              manualNetRow.classList.remove('hidden');
              manualNetEl.textContent = formatEuroRounded(candidateData.monthlyNetSalary);
          } else {
              manualNetRow.classList.add('hidden');
              manualNetEl.textContent = '€0';
          }
      }
      const commuteRow = document.getElementById('commute-monthly-display');
      const commuteValueEl = document.getElementById('commute-monthly');
      if (commuteRow && commuteValueEl) {
          // Force hidden in Candidate Offer per request
          commuteRow.classList.add('hidden');
          commuteValueEl.textContent = '€0';
      }
      // Candidate summary removed
      // Sales team section
      const salesTotal = document.getElementById('sales-total-cost-year');
      const salesMargin = document.getElementById('sales-selected-margin');
      const salesRate = document.getElementById('sales-daily-rate');
      if (salesTotal) salesTotal.textContent = formatEuro(totalCostPerYear);
      if (salesMargin) salesMargin.textContent = `${formatEuroRounded(candidateData.targetMargin || 0)}/year`;
      if (salesRate) salesRate.textContent = `${formatEuroRounded(finalRate)}`;
      // Render final Net Benefits chart with selections from Phase 3
      try { renderFinalBenefitsChart({
          representationMonthly,
          ecoMonthly: candidateData.benefits.ecoChecque ? (ECO_VOUCHER_ANNUAL_EUR / 12) : 0,
          hospitalizationMonthly: candidateData.benefits.hospitalization ? HOSPITALIZATION_MONTHLY_EUR : 0,
          mealVoucherMonthly: candidateData.benefits.mealVoucher ? ((WORKING_DAYS_PER_YEAR * MEAL_VOUCHER_EUR) / 12) : 0,
          pensionMonthly: candidateData.benefits.pensionPlan ? ((pensionPct / 100) * annualGrossSalary) / 12 : 0,
          accidentMonthly: candidateData.benefits.accidentInsurance ? ACCIDENT_INSURANCE_MONTHLY_EUR : 0
      }); } catch (e) {}
      
      // AGAD calculations display
      document.getElementById('package-type').textContent = selectedPackage;
      setTextContentById('agad-monthly-gross', formatEuroRounded(monthlyGross));
      setTextContentById('double-holiday', formatEuroRounded(doubleHolidayPay));
      setTextContentById('agad-annual-gross', formatEuroRounded(annualGrossSalary));
      setTextContentById('annual-gross-no-holiday', formatEuroRounded(annualGrossNoHoliday));
      // Removed Social Contribution row from display
    document.getElementById('total-salary-cost').textContent = formatEuro(totalSalaryCost);
      // Removed Target Margin row from display
      document.getElementById('group-insurance-status').textContent = candidateData.benefits.pensionPlan ? `${pensionPct}% (€${Math.round(pensionAnnual).toLocaleString()}/year)` : 'No';
     document.getElementById('collective-benefits-status').textContent = candidateData.benefits.accidentInsurance ? '€20/month' : '€0';
      document.getElementById('meal-voucher-monthly').textContent = candidateData.benefits.mealVoucher ? formatEuroRounded(mealVoucherAnnual) : `€0`;
      const mvPerDayEl = document.getElementById('meal-voucher-per-day');
      if (mvPerDayEl) mvPerDayEl.textContent = `€${MEAL_VOUCHER_EUR}`;
      document.getElementById('eco-voucher-monthly').textContent = candidateData.benefits.ecoChecque ? formatEuroRounded(ECO_VOUCHER_ANNUAL_EUR) : `€0`;
      setTextContentById('home-office-monthly', formatEuroRounded(homeOfficeMonthly));
     document.getElementById('dkv-hospitalization-status').textContent = `${formatEuro(HOSPITALIZATION_MONTHLY_EUR)}/month`.replace('€€','€');
      setTextContentById('internet-allowance-monthly', formatEuroRounded(internetMonthly));
      document.getElementById('phone-allowance-monthly').textContent = `${Math.round(phoneMonthly).toLocaleString()}€`;
      setTextContentById('representation-allowance-monthly', formatEuroRounded(representationMonthly));
      // AGAD breakdown: hide net salary excl. benefits when not manually provided
      const netSalaryPerMonthRow = document.getElementById('net-salary-per-month')?.closest('tr');
      if (netSalaryPerMonthRow) {
          if (hasManualNetSalary) netSalaryPerMonthRow.classList.remove('hidden');
          else netSalaryPerMonthRow.classList.add('hidden');
      }
      setTextContentById('net-salary-per-month', hasManualNetSalary ? formatEuroRounded(monthlyNetEstimated) : '€0');
      setTextContentById('net-benefits-per-month', formatEuroRounded(netBenefits));
      // Toggle optional benefit rows visibility based on selection
      const toggleRow = (spanId, show) => {
          const row = document.getElementById(spanId)?.closest('tr');
          if (!row) return;
          if (show) row.classList.remove('hidden'); else row.classList.add('hidden');
      };
      // Show meal voucher row in AGAD breakdown when selected
      toggleRow('meal-voucher-monthly', !!candidateData.benefits.mealVoucher);
      toggleRow('eco-voucher-monthly', !!candidateData.benefits.ecoChecque);
      toggleRow('home-office-monthly', !!candidateData.benefits.homeOfficeAllowance);
      toggleRow('internet-allowance-monthly', !!candidateData.benefits.homeInternet && internetMonthly > 0);
      toggleRow('phone-allowance-monthly', !!candidateData.benefits.phoneAllowance && phoneMonthly > 0);
      toggleRow('representation-allowance-monthly', !!candidateData.benefits.representation && representationMonthly > 0);
      toggleRow('group-insurance-status', !!candidateData.benefits.pensionPlan);
      toggleRow('collective-benefits-status', !!candidateData.benefits.accidentInsurance);
      // Only show rows in AGAD table for items the user selected
      const showRowById = (id, show) => { const el = document.getElementById(id); if (el) { const tr = el.closest('tr'); if (tr) { if (show) tr.classList.remove('hidden'); else tr.classList.add('hidden'); } } };
      showRowById('meal-voucher-monthly', !!candidateData.benefits.mealVoucher);
      showRowById('eco-voucher-monthly', !!candidateData.benefits.ecoChecque);
      showRowById('home-office-monthly', !!candidateData.benefits.homeOfficeAllowance);
      showRowById('internet-allowance-monthly', !!candidateData.benefits.homeInternet && internetMonthly > 0);
      showRowById('phone-allowance-monthly', !!candidateData.benefits.phoneAllowance && phoneMonthly > 0);
      showRowById('representation-allowance-monthly', !!candidateData.benefits.representation && representationMonthly > 0);
      showRowById('group-insurance-status', !!candidateData.benefits.pensionPlan);
      showRowById('collective-benefits-status', !!candidateData.benefits.accidentInsurance);
      setTextContentById('net-earnings-monthly', formatEuroRounded(monthlyNetEstimated + netBenefitsMonthlyForNet));
      
      // Mobility display (per month)
      const mobilityRow = document.getElementById('mobility-display');
      const mobilityValueEl = document.getElementById('mobility-value');
      const agadMobilityBudgetRow = document.getElementById('agad-mobility-budget-row');
      const agadMobilityBudgetEl = document.getElementById('agad-mobility-budget-monthly');
      let monthlyMobility = 0;
      let mobilityLabel = '';
      if (candidateData.carSelected && candidateData.carCost) {
          monthlyMobility = candidateData.carCost / 12;
          mobilityLabel = 'Car';
      } else if (candidateData.mobilityBudget) {
          monthlyMobility = candidateData.mobilityBudget;
          mobilityLabel = 'Mobility Budget';
      }
      // mobilityBudgetMonthly already computed above
      if (monthlyMobility > 0 && !candidateData.carSelected) { // hide when car is selected
          mobilityRow.classList.remove('hidden');
          mobilityValueEl.textContent = `${formatEuroRounded(monthlyMobility)}/month`;
          } else {
          mobilityRow.classList.add('hidden');
          mobilityValueEl.textContent = '€0';
      }
      // Update AGAD mobility and commute
      const agadMobEl = document.getElementById('agad-mobility-monthly');
      if (agadMobEl) {
          // Always hide car mobility row in AGAD breakdown
          agadMobEl.textContent = '€0';
          const agadMobRow = agadMobEl.closest('tr');
          if (agadMobRow) agadMobRow.classList.add('hidden');
      }
      if (agadMobilityBudgetRow && agadMobilityBudgetEl) {
          if (!!candidateData.mobilityBudget && !candidateData.carSelected) {
              agadMobilityBudgetRow.classList.remove('hidden');
              agadMobilityBudgetEl.textContent = `${formatEuroRounded(mobilityBudgetMonthly)}`;
          } else {
              agadMobilityBudgetRow.classList.add('hidden');
              agadMobilityBudgetEl.textContent = '€0';
          }
      }
      const agadCommuteEl = document.getElementById('agad-commute-monthly');
      const agadCommuteRow = document.getElementById('agad-commute-row');
      if (agadCommuteEl && agadCommuteRow) {
          agadCommuteEl.textContent = `${formatEuroRounded(commuteMonthly)}`;
          if (commuteMonthly > 0) { agadCommuteRow.classList.remove('hidden'); } else { agadCommuteRow.classList.add('hidden'); }
      }
      // Total Net Per Month = Net Incl. Benefits + Mobility Budget (if selected)
      const totalNetPerMonth = (monthlyNetEstimated + netBenefitsMonthlyForNet) + mobilityBudgetMonthly;
      const totalNetEl = document.getElementById('total-net-per-month');
      if (totalNetEl) totalNetEl.textContent = `€${Math.round(totalNetPerMonth).toLocaleString()}`;
      const agadTotalNetEl = document.getElementById('agad-total-net-per-month');
      if (agadTotalNetEl) agadTotalNetEl.textContent = `€${Math.round(totalNetPerMonth).toLocaleString()}`;
      const agadNetEarningsEl = document.getElementById('net-earnings-monthly');
      if (agadNetEarningsEl) agadNetEarningsEl.textContent = `€${Math.round(totalNetPerMonth).toLocaleString()}`;
      const candidateNetEl = document.getElementById('candidate-net-salary');
      if (candidateNetEl) candidateNetEl.textContent = `€${Math.round(monthlyNetEstimated).toLocaleString()}`;

      // Net-based recalculation removed to avoid undefined variables and conflicting logic
      
      // Extra Benefits summary and breakdown
      const benefitsList = [];
      const breakdownRows = [];
      const getBadge = (label) => {
          const inList = (arr) => arr.some((k) => label.includes(k));
          const transport = ['Public Transport', 'Bicycle', 'Car Wash', 'Parking', 'Garage', 'Fuel Card'];
          const homeworking = ['Home Office', 'Internet', 'Office Equipment', 'Printer/Scanner', 'IT Equipment'];
          const insurance = ['Hospitalization', 'Group Insurance', 'Collective Benefits'];
          const other = ['Meal Voucher', 'Eco Cheque', 'Year-End Bonus', 'Training Budget', 'Phone Allowance', 'Representation'];
          if (inList(transport)) return { text: 'Transport', cls: 'bg-blue-100 text-blue-700' };
          if (inList(homeworking)) return { text: 'Homeworking', cls: 'bg-green-100 text-green-700' };
          if (inList(insurance)) return { text: 'Insurance', cls: 'bg-slate-100 text-slate-700' };
          if (inList(other)) return { text: 'Other', cls: 'bg-amber-100 text-amber-700' };
          return { text: '', cls: '' };
      };
      const renderLabelWithBadge = (label) => {
          const badge = getBadge(label);
          return badge.text
              ? `${label} <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}">${badge.text}</span>`
              : label;
      };
      const pushRow = (label, value) => {
          const isPhone = label === 'Phone Allowance';
          const formatted = isPhone ? `${Math.round(value).toLocaleString()}€/month` : `€${Math.round(value).toLocaleString()}`;
          breakdownRows.push(`<tr class="border-b"><td class="py-1 text-gray-600">${renderLabelWithBadge(label)}</td><td class="py-1 text-right">${formatted}</td></tr>`);
      };
      const pushRowText = (label, text) => {
          breakdownRows.push(`<tr class="border-b"><td class="py-1 text-gray-600">${renderLabelWithBadge(label)}</td><td class="py-1 text-right">${text}</td></tr>`);
      };
      // Build selected list and monthly amounts (include standard benefits too)
      if (mealVoucherMonthly > 0) { benefitsList.push('Meal Voucher'); pushRow('Meal Voucher', mealVoucherMonthly); }
      if (candidateData.benefits.ecoChecque) { benefitsList.push('Eco Cheque'); pushRow('Eco Cheque', ecoVoucherMonthly); }
      if (candidateData.benefits.hospitalization) { benefitsList.push('Hospitalization'); pushRow('Hospitalization', hospitalizationMonthly); }
      if (candidateData.benefits.pensionPlan) { benefitsList.push('Pension Plan'); pushRow('Pension Plan', pensionMonthly); }
      if (candidateData.benefits.accidentInsurance) { benefitsList.push('Accident Insurance'); pushRow('Accident Insurance', accidentMonthly); }
      if (candidateData.benefits.homeOfficeAllowance) { benefitsList.push('Home Office Allowance'); pushRow('Home Office Allowance', homeOfficeMonthly); }
      if (internetMonthly > 0) { benefitsList.push('Internet Allowance'); pushRow('Internet Allowance', internetMonthly); }
      if (phoneMonthly > 0) { benefitsList.push('Phone Allowance'); pushRow('Phone Allowance', phoneMonthly); }
      if (representationMonthly > 0) { benefitsList.push('Representation Allowance'); pushRow('Representation Allowance', representationMonthly); }
      if (publicTransportMonthly > 0) { benefitsList.push('Public Transport'); pushRow('Public Transport', publicTransportMonthly); }
      if (bicycleMonthly > 0) { benefitsList.push('Bicycle Allowance'); pushRow('Bicycle Allowance', bicycleMonthly); }
      if (carWashMonthly > 0) { benefitsList.push('Car Wash'); pushRow('Car Wash', carWashMonthly); }
      if (yearEndBonusMonthly > 0) { benefitsList.push('Year-End Bonus'); pushRow('Year-End Bonus (Monthly Equivalent)', yearEndBonusMonthly); }
      if (parkingMonthly > 0) { benefitsList.push('Parking'); pushRow('Parking', parkingMonthly); }
      if (officeEquipmentMonthly > 0) { benefitsList.push('Office Equipment (Monthly)'); pushRow('Office Equipment (Monthly)', officeEquipmentMonthly); }
      (function(){
          const bs = document.getElementById('benefits-summary');
          if (bs) bs.textContent = `Extra Benefits: ${benefitsList.join(', ')}`;
      })();
      const breakdown = null;
      const listEl = null;
      const toggleBtn = null;
      if (listEl && breakdown && toggleBtn) {
          listEl.innerHTML = breakdownRows.join('');
          // Default collapsed each calculation; show button only if there are rows
          if (breakdownRows.length === 0) {
              breakdown.classList.remove('open');
              breakdown.style.maxHeight = '0px';
              toggleBtn.classList.add('hidden');
          } else {
              breakdown.classList.remove('open');
              breakdown.style.maxHeight = '0px';
              toggleBtn.classList.remove('hidden');
              toggleBtn.textContent = 'Show details';
          }
      }
      // Populate Selected Benefits table in Candidate Offer (only three specified items)
      (function renderSelectedBenefitsTable(){
          const body = document.getElementById('selected-benefits-body');
          const section = document.getElementById('selected-benefits-section');
          if (!body || !section) return;
          const rows = [];
          const addRow = (label, rightText) => rows.push(`<tr class="border-b odd:bg-white even:bg-gray-50 hover:bg-gray-50 transition-colors"><td class="py-2 px-3 text-gray-700">${renderLabelWithBadge(label)}</td><td class="py-2 px-3 text-right text-gray-900">${rightText}</td></tr>`);
          // Only: Meal vouchers, Eco cheques, Hospitalization insurance, Accident insurance
          if (candidateData.benefits.mealVoucher) addRow('Meal Voucher', `per working day = €${MEAL_VOUCHER_EUR}`);
          if (candidateData.benefits.ecoChecque) addRow('Eco Cheque', `per year = €${ECO_VOUCHER_ANNUAL_EUR}`);
         if (candidateData.benefits.hospitalization) addRow('Hospitalization', 'Premium');
         if (candidateData.benefits.accidentInsurance) addRow('Accident Insurance', 'Included');
          body.innerHTML = rows.join('');
          // Toggle visibility based on whether any net-included benefits exist
          if (rows.length > 0) section.classList.remove('hidden');
          else section.classList.add('hidden');
      })();
      // Render only net-included selected benefits inside the Candidate Offer table
      (function renderOfferTableBenefits(){
          const offerTbody = document.getElementById('candidate-offer-net-benefits');
          if (!offerTbody) return;
          const rows = [];
          const addRow = (left, right) => rows.push(`<tr class="border-b"><td class="py-2 text-gray-600">${renderLabelWithBadge(left)}</td><td class="py-2 text-right"><span class="font-medium">${right}</span></td></tr>`);
          // Company car (show type/model when selected)
          if (candidateData.carSelected && candidateData.carLabel) addRow('Car + Fuel Card', candidateData.carLabel);
          // Net-included items only (exclude Meal/Eco/Hospitalization/Accident)
          if (candidateData.benefits.homeOfficeAllowance && homeOfficeMonthly > 0) addRow('Home Office Allowance', `${formatEuroRounded(homeOfficeMonthly)}/month`);
          if (internetMonthly > 0) addRow('Internet Allowance', `${formatEuroRounded(internetMonthly)}/month`);
          if (phoneMonthly > 0) addRow('Phone Allowance', `€${Math.round(phoneMonthly).toLocaleString()}/month`);
          if (representationMonthly > 0) addRow('Representation Allowance', `${formatEuroRounded(representationMonthly)}/month`);
          if (publicTransportMonthly > 0) addRow('Public Transport', `${formatEuroRounded(publicTransportMonthly)}/month`);
          if (bicycleMonthly > 0) addRow('Bicycle Allowance', `${formatEuroRounded(bicycleMonthly)}/month`);
          if (carWashMonthly > 0) addRow('Car Wash', `${formatEuroRounded(carWashMonthly)}/month`);
          if (yearEndBonusMonthly > 0) addRow('Year-End Bonus (Monthly Equivalent)', `${formatEuroRounded(yearEndBonusMonthly)}/month`);
          if (parkingMonthly > 0) addRow('Parking', `${formatEuroRounded(parkingMonthly)}/month`);
          if (officeEquipmentMonthly > 0) addRow('Office Equipment (Monthly)', `${formatEuroRounded(officeEquipmentMonthly)}/month`);
          offerTbody.innerHTML = rows.join('');
          if (rows.length > 0) offerTbody.classList.remove('hidden');
          else offerTbody.classList.add('hidden');
      })();
  }

  // ===== Benefits Charts & Tables =====
  /** Render final Net Benefits mini chart on Phase 5. */
  function renderFinalBenefitsChart(values) {
      const canvas = document.getElementById('benefits-chart-final');
      if (!canvas || !window.Chart) return;
      const labels = ['Representation allowance', 'Eco voucher', 'Hospitalization', 'Meal voucher', 'Pension plan', 'Accident insurance'];
      const data = [
          values.representationMonthly || 0,
          values.ecoMonthly || 0,
          values.hospitalizationMonthly || 0,
          values.mealVoucherMonthly || 0,
          values.pensionMonthly || 0,
          values.accidentMonthly || 0
      ];
      const ctx = canvas.getContext('2d');
      if (canvas._chart) { canvas._chart.destroy(); }
      const chart = new window.Chart(ctx, {
          type: 'bar',
          data: { labels, datasets: [{ label: '€ per month', data, backgroundColor: 'rgba(59, 130, 246, 0.6)', borderColor: 'rgb(59, 130, 246)', borderWidth: 1 }] },
          options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { beginAtZero: true } }, plugins: { legend: { display: false }, title: { display: false } } }
      });
      canvas._chart = chart;
      const total = data.reduce((sum, v) => sum + (Number(v) || 0), 0);
      const totalEl = document.getElementById('benefits-chart-final-total');
      if (totalEl) totalEl.textContent = formatEuroRounded(total);
  }

// Benefits modal open/close and content
(function(){
    const openBtn = document.getElementById('open-benefits-modal');
    const modal = document.getElementById('benefits-modal');
    const body = document.getElementById('benefits-modal-body');
    if (!openBtn || !modal || !body) return;
    openBtn.addEventListener('click', function(){
        const section = document.getElementById('selected-benefits-section');
        if (section) {
            const clone = section.cloneNode(true);
            clone.classList.remove('hidden');
            // Add fade-in animation to each row
            clone.querySelectorAll('tbody > tr').forEach((tr, idx) => {
                tr.classList.add('animate-fade-in');
                tr.style.animationDelay = (idx * 40) + 'ms';
            });
            body.innerHTML = '';
            body.appendChild(clone);
        } else {
            body.innerHTML = '<p class="text-sm text-gray-600">No benefits to display.</p>';
        }
        modal.classList.remove('hidden');
    });
    document.addEventListener('click', function(e){
        if (e.target.closest('#close-benefits-modal')) {
            modal.classList.add('hidden');
        }
    });
    modal.addEventListener('click', function(e){ if (e.target === modal) modal.classList.add('hidden'); });
})();

  // Start over functionality
  document.getElementById('start-over').addEventListener('click', function() {
      location.reload();
  });

  // Export functionality
  document.getElementById('export-calculation').addEventListener('click', function() {
      const container = document.getElementById('phase5');
      if (!container || typeof window.html2pdf === 'undefined') {
          return;
      }

      const options = {
          margin: [10, 10, 10, 10],
          filename: 'agad-candidate-calculation.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const controlsRow = container.querySelector('.text-center.mt-8.space-x-4');
      const previousDisplay = controlsRow ? controlsRow.style.display : null;
      if (controlsRow) { controlsRow.style.display = 'none'; }

      const showOfferButton = container.querySelector('#open-offer-modal');
      const previousOfferDisplay = showOfferButton ? showOfferButton.style.display : null;
      if (showOfferButton) { showOfferButton.style.display = 'none'; }

      window.html2pdf()
          .set(options)
          .from(container)
          .save()
          .finally(function() {
              if (controlsRow) { controlsRow.style.display = previousDisplay || ''; }
              if (showOfferButton) { showOfferButton.style.display = previousOfferDisplay || ''; }
          });
  });

  // Toggle benefits breakdown
  // Removed toggle-benefits click handler

  // Margin handlers (Phase 4) â€” initialize after DOM is ready
  (function setupMarginHandlers(){
      const standard = document.getElementById('margin-standard');
      const payrolling = document.getElementById('margin-payrolling');
      const manual = document.getElementById('margin-manual');
      const manualAmount = document.getElementById('manual-margin-amount');
      if (standard) {
          standard.addEventListener('change', function(){
              if (this.checked) {
                  candidateData.targetMargin = 36000;
                  if (manualAmount) { manualAmount.disabled = true; }
              }
          });
      }
      if (payrolling) {
          payrolling.addEventListener('change', function(){
              if (this.checked) {
                  candidateData.targetMargin = PAYROLLING_MARGIN_ANNUAL_EUR;
                  if (manualAmount) { manualAmount.disabled = true; }
              }
          });
      }
      if (manual) {
          manual.addEventListener('change', function(){
              if (this.checked) {
                  if (manualAmount) {
                      manualAmount.disabled = false;
                      const val = parseNumericInput(manualAmount.value || '');
                      // No minimum
                      candidateData.targetMargin = isNaN(val) ? 0 : val;
                  }
              }
          });
      }
      if (manualAmount) {
          manualAmount.addEventListener('input', function(){
              const val = parseNumericInput(this.value || '');
              candidateData.targetMargin = val;
          });
      }
  })();

  // Net Benefits table data for Phase 3 (exclude Eco voucher, Hospitalization, Meal voucher, Pension plan, Accident insurance)
  function getBenefitsChartData() {
      const labels = [];
      const data = [];

      // Representation first
      const repChecked = document.getElementById('representation')?.checked === true;
      const repAmountRaw = document.getElementById('representation-amount')?.value || '';
      const repAmount = repChecked ? Math.min(250, Math.max(0, parseNumericInput(repAmountRaw))) : 0;
      labels.push('Representation allowance');
      data.push(repAmount);

      // Home office allowance
      const hoChecked = document.getElementById('home-office-allowance')?.checked === true;
      if (hoChecked) { labels.push('Home Office Allowance'); data.push(148.73); }

      // Internet allowance (up to €20)
      const internetChecked = document.getElementById('home-internet')?.checked === true;
      const internetAmt = internetChecked ? Math.min(20, Math.max(0, parseNumericInput(document.getElementById('home-internet-amount')?.value || '0'))) : 0;
      if (internetChecked && internetAmt > 0) { labels.push('Internet Allowance'); data.push(internetAmt); }

      // Phone allowance (up to €30)
      const phoneChecked = document.getElementById('phone-allowance')?.checked === true;
      const phoneAmt = phoneChecked ? Math.min(30, Math.max(0, parseNumericInput(document.getElementById('phone-allowance-amount')?.value || '0'))) : 0;
      if (phoneChecked && phoneAmt > 0) { labels.push('Phone Allowance'); data.push(phoneAmt); }

      // Public transport (free amount)
      const ptChecked = document.getElementById('public-transport')?.checked === true;
      const ptAmt = ptChecked ? Math.max(0, parseNumericInput(document.getElementById('public-transport-amount')?.value || '0')) : 0;
      if (ptChecked && ptAmt > 0) { labels.push('Public Transport'); data.push(ptAmt); }

      // Bicycle allowance (from candidateData.bicycleBudget)
      const bicycleChecked = document.getElementById('bicycle-allowance')?.checked === true;
      const bicycleMonthly = bicycleChecked ? (candidateData.bicycleBudget || 0) : 0;
      if (bicycleChecked && bicycleMonthly > 0) { labels.push('Bicycle Allowance'); data.push(bicycleMonthly); }

      // Car wash (max €10)
      const carWashChecked = document.getElementById('car-wash')?.checked === true;
      const carWashAmt = carWashChecked ? Math.min(10, Math.max(0, parseNumericInput(document.getElementById('car-wash-amount')?.value || '0'))) : 0;
      if (carWashChecked && carWashAmt > 0) { labels.push('Car Wash'); data.push(carWashAmt); }

      // Parking subscription (fixed €150 when available)
      const parkingChecked = document.getElementById('parking-subscription')?.checked === true;
      if (parkingChecked) { labels.push('Parking'); data.push(150); }

      // Office equipment monthly option only (€20)
      const officeEqChecked = document.getElementById('office-equipment')?.checked === true;
      const eqType = document.getElementById('equipment-type')?.value;
      if (officeEqChecked && eqType === '20') { labels.push('Office Equipment (Monthly)'); data.push(20); }

      return { labels, data };
  }

  /** Initialize the (unused) bar chart instance if needed. */
  function initBenefitsChart() {
      const canvas = document.getElementById('benefits-chart');
      if (!canvas || !window.Chart) return;
      const ctx = canvas.getContext('2d');
      benefitsChart = new window.Chart(ctx, {
          type: 'bar',
          data: { labels: [], datasets: [{ label: '€ per month', data: [], backgroundColor: 'rgba(59, 130, 246, 0.6)', borderColor: 'rgb(59, 130, 246)', borderWidth: 1 }] },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y',
              scales: { x: { beginAtZero: true } },
              plugins: { legend: { display: false }, title: { display: true, text: 'Net Benefit Provided' } }
          }
      });
  }

  /** Update the compact net benefits table in Phase 3. */
  function updateBenefitsChart() {
      // Use a compact table instead of a chart in Phase 3
      const tableBody = document.getElementById('benefits-table-body');
      const totalEl = document.getElementById('benefits-chart-total');
      if (!tableBody) return;
      const { labels, data } = getBenefitsChartData();
      const rows = [];
      for (let i = 0; i < labels.length; i++) {
          const label = labels[i];
          const value = Number(data[i]) || 0;
          rows.push(`<tr class="border-b"><td class="py-1 px-3 text-gray-600">${label}</td><td class="py-1 px-3 text-right">€${Math.round(value).toLocaleString()}</td></tr>`);
      }
      tableBody.innerHTML = rows.join('');
      const total = data.reduce((sum, v) => sum + (Number(v) || 0), 0);
      if (totalEl) totalEl.textContent = formatEuroRounded(total);
  }

  (function setupBenefitsChartListeners(){
      const ids = [
          'representation','representation-amount',
          'home-office-allowance',
          'home-internet','home-internet-amount',
          'phone-allowance','phone-allowance-amount',
          'public-transport','public-transport-amount',
          'bicycle-allowance','bicycle-km',
          'car-wash','car-wash-amount',
          'parking-subscription',
          'office-equipment','equipment-type'
      ];
      ids.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          const evt = (id.endsWith('-amount') || id === 'representation-amount' || id === 'bicycle-km') ? 'input' : 'change';
          el.addEventListener(evt, updateBenefitsChart);
      });
      // Initial draw
      try { updateBenefitsChart(); } catch (e) {}
  })();

  // Explicit button to open offer modal
  (function(){
      const btn = document.getElementById('open-offer-modal');
      if (!btn) return;
      btn.addEventListener('click', function(){
          openOfferModal();
      });
  })();

  /** Clone the AGAD breakdown table into the modal and open it. */
  function openOfferModal() {
      const container = document.getElementById('agad-modal-body');
      const modal = document.getElementById('agad-modal');
      const agad = document.getElementById('agad-table');
      if (!container || !modal || !agad) return;
      const agadClone = agad.cloneNode(true);
      container.innerHTML = '';
      // animate rows on insert
      agadClone.querySelectorAll('tbody > tr').forEach((tr, idx) => {
          tr.classList.add('animate-fade-in');
          tr.style.animationDelay = (idx * 40) + 'ms';
      });
      container.appendChild(agadClone);
      modal.classList.remove('hidden');
  }

  // Close modal handlers
  document.addEventListener('click', function(e) {
      const closeBtn = e.target.closest('#close-agad-modal');
      const modal = document.getElementById('agad-modal');
      if (closeBtn && modal) {
          modal.classList.add('hidden');
      }
  });
  // Click outside to close
  (function(){
      const modal = document.getElementById('agad-modal');
      if (!modal) return;
      modal.addEventListener('click', function(e){
          if (e.target === modal) modal.classList.add('hidden');
      });
  })();

}

