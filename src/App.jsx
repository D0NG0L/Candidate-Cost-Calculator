import { useEffect } from 'react'
import { initCalculator } from './legacy/calculator.js'

const legacyMarkup = String.raw`
        <!-- Tailwind safelist for dynamic badge classes -->
        <div class="hidden">
            <span class="bg-blue-100 text-blue-700 bg-green-100 text-green-700 bg-slate-100 text-slate-700 bg-amber-100 text-amber-700 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 bg-gray-100 text-gray-700 border-blue-500 bg-blue-50"></span>
        </div>
        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <!-- Header -->
            <div class="text-center mb-8">
                <a href="https://agadtechnology.com/" target="_blank" rel="noopener noreferrer">
                    <img id="app-logo" src="/logo.png" alt="AGAD Logo" class="mx-auto mb-4 h-12 object-contain">
                </a>
                <h1 class="text-4xl font-bold text-gray-800 mb-2">AGAD Candidate Cost Calculator</h1>
                <p class="text-gray-600">Calculate comprehensive candidate package costs</p>
            </div>
    
            <!-- Phase Indicator -->
            <div class="flex justify-center mb-8">
                <div class="flex space-x-2 md:space-x-4">
                    <div class="phase-indicator stage-animated phase-active px-3 py-2 rounded-full text-xs md:text-sm font-medium">
                        1. Details
                    </div>
                    <div class="phase-indicator stage-animated bg-gray-200 text-gray-600 px-3 py-2 rounded-full text-xs md:text-sm font-medium">
                        2. Salary & Mobility
                    </div>
                    <div class="phase-indicator stage-animated bg-gray-200 text-gray-600 px-3 py-2 rounded-full text-xs md:text-sm font-medium">
                        3. Net Extra Benefits
                    </div>
                    <div class="phase-indicator stage-animated bg-gray-200 text-gray-600 px-3 py-2 rounded-full text-xs md:text-sm font-medium">
                        4. Target Margin
                    </div>
                    <div class="phase-indicator stage-animated bg-gray-200 text-gray-600 px-3 py-2 rounded-full text-xs md:text-sm font-medium">
                        5. Output
                    </div>
                </div>
            
            </div>
    
            <!-- Phase 1: Candidate Details -->
            <div id="phase1" class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Phase 1: Candidate Details</h2>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                        <select id="experience" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select experience...</option>
                            <option value="0-2">0-2 years (Junior)</option>
                            <option value="3-5">3-5 years</option>
                            <option value="6-9">6-9 years</option>
                            <option value="10+">10+ years</option>
                        </select>
                        <div id="experience-error" class="error-message hidden">Please select years of experience</div>
                    </div>
    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Work Model</label>
                        <select id="work-model" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select work model...</option>
                            <option value="On-site">Fully Onsite</option>
                            <option value="Hybrid">Hybrid (select onsite days/week)</option>
                            <option value="Remote">Fully Remote</option>
                        </select>
                        <div id="work-model-error" class="error-message hidden">Please select work model</div>
                    </div>
    
                    <div id="hybrid-days-container" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Hybrid: On-site days per week</label>
                        <select id="hybrid-onsite-days" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select days/week...</option>
                            <option value="1">1 day/week</option>
                            <option value="2">2 days/week</option>
                            <option value="3">3 days/week</option>
                            <option value="4">4 days/week</option>
                        </select>
                        <div id="hybrid-days-error" class="error-message hidden">Please select on-site days/week for Hybrid</div>
                    </div>
    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <select id="position" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select position type...</option>
                            <option value="Technical">Technical</option>
                            <option value="Non-technical">Non-technical</option>
                        </select>
                        <div id="position-error" class="error-message hidden">Please select position type</div>
                    </div>
    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                        <select id="nationality" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select nationality...</option>
                            <option value="Belgian">Belgium</option>
                            <option value="Other">Other</option>
                        </select>
                        <div id="nationality-error" class="error-message hidden">Please select nationality</div>
                    </div>
                </div>
    
                <div class="text-center mt-8">
                    <button id="continue-phase1" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                        Continue to Salary & Mobility
                    </button>
                </div>
            </div>
    
            <!-- Phase 2: Salary and Mobility -->
            <div id="phase2" class="hidden bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Phase 2: Salary and Mobility</h2>
                
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Monthly Gross Salary (€)</label>
                        <input type="number" id="monthly-salary" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter monthly gross salary" min="0" step="0.01">
                        <div id="salary-guidance" class="text-sm text-blue-600 mt-1 hidden">
                            Salary range for this category: €<span id="min-salary">0</span> - €<span id="max-salary">0</span>
                        </div>
                        <div id="salary-error" class="error-message hidden">Please enter a valid salary</div>
                        <div id="salary-minimum-error" class="error-message hidden">Minimum salary requirement not met</div>
                        
                        <!-- Optional: Monthly Net Salary (manual override) -->
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Monthly Net Salary (€)</label>
                            <input type="number" id="monthly-net-salary" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter monthly net salary" min="0" step="0.01">
                            <div class="text-xs text-gray-500 mt-1">Used as-is. No automatic estimation.</div>
                        </div>
                    </div>
    
                    <!-- Mobility Options -->
                    <div class="space-y-6">
                        <h3 class="text-lg font-semibold text-gray-800">Mobility Options (Select One)</h3>
                        
                        <!-- Company Car -->
                        <div id="car-section" class="border rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-4">
                                <input type="checkbox" id="company-car" class="w-5 h-5 text-blue-600">
                                <label for="company-car" class="text-sm font-medium text-gray-700">Company Car + Fuel Card</label>
                            </div>
    
                            <div id="car-options" class="hidden ml-8 space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Car Category</label>
                                    <select id="car-list" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">Select a car...</option>
                                        <option value="11640">TOYOTA BZ4X 2023 Electric SUV - €11,640/year</option>
                                        <option value="9156">VOLKSWAGEN TAIGO Diesel 2023 - €9,156/year</option>
                                        <option value="8712">Nissan Juke Petrol 2023 - €8,712/year</option>
                                    </select>
                                </div>
                                
                                <!-- Auto-selected Fuel Card -->
                                <div class="bg-blue-50 p-3 rounded">
                                    <div class="flex items-center space-x-3">
                                        <input type="checkbox" id="fuel-card" class="w-5 h-5 text-blue-600" checked disabled>
                                        <label class="text-sm font-medium text-gray-700">Fuel Card (Automatically included)</label>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        <!-- Mobility Budget -->
                        <div id="mobility-section" class="border rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-4">
                                <input type="checkbox" id="mobility-budget-option" class="w-5 h-5 text-blue-600">
                                <label for="mobility-budget-option" class="text-sm font-medium text-gray-700">Mobility Budget</label>
                            </div>
    
                            <div id="mobility-options" class="hidden ml-8">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Select Mobility Budget Category</label>
                                <select id="mobility-budget" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select category...</option>
                                    <option value="600">Category 1 - €600/month</option>
                                    <option value="700">Category 2 - €700/month</option>
                                    <option value="800">Category 3 - €800/month</option>
                                    <option value="900">Category 4 - €900/month</option>
                                </select>
                            </div>
                        </div>
    
                        <!-- Bicycle Allowance -->
                        <div id="bicycle-section" class="border rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-4">
                                <input type="checkbox" id="bicycle-allowance" class="w-5 h-5 text-blue-600">
                                <label for="bicycle-allowance" class="text-sm font-medium text-gray-700">Bicycle Allowance</label>
                            </div>
    
                            <div id="bicycle-options" class="hidden ml-8 space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Bicycle Allowance â€” €0.27/km (legal max)</label>
                                <p class="text-xs text-gray-500">Monthly: for commuting by bike; cannot be combined with mobility budget or company car.</p>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Commute distance (km/month)</label>
                                <input type="number" id="bicycle-km" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter km/month" min="0" step="0.1">
                                <div class="text-sm text-gray-700">Monthly allowance: €<span id="bicycle-monthly-allowance">0.00</span></div>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="text-center mt-8 space-x-4">
                    <button id="previous-phase2" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium">
                        Previous
                    </button>
                    <button id="continue-phase2" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                        Continue to Extra Benefits
                    </button>
                </div>
            </div>
    
            <!-- Phase 3: Net Benefits -->
            <div id="phase3" class="hidden bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Phase 3: Net Extra Benefits</h2>
                
                <div class="space-y-6">
                    <!-- Pre-checked Benefits -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Standard Extra Benefits</h3>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Meal Voucher</span>
                                    <p class="text-xs text-gray-500">Per working day €8. </p>
                                </div>
                                <input type="checkbox" id="meal-voucher" class="w-5 h-5 text-blue-600" checked>
                            </div>
                            
                            <div class="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">ECO Voucher (per year)</span>
                                    <p class="text-sm text-gray-600">€250</p>
                                </div>
                                <input type="checkbox" id="eco-cheque" class="w-5 h-5 text-blue-600" checked>
                            </div>
                            
                            <div class="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div>
                                    <span class="font-medium">Hospitalization Premium</span>
                                    <p class="text-sm text-gray-600">€30/month (Always included)</p>
                                </div>
                                <input type="checkbox" id="hospitalization" class="w-5 h-5 text-blue-600" checked disabled>
                            </div>
                        </div>
                    </div>
    
                    <!-- Optional Benefits -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Optional Extra Benefits</h3>
                        <h4 class="mt-2 mb-2 text-md font-semibold text-gray-700">Other Allowances</h4>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Pension Plan</span>
                                    <p class="text-sm text-gray-600">Additional retirement savings</p>
                                </div>
                                <input type="checkbox" id="pension-plan" class="w-5 h-5 text-blue-600">
                            </div>
                            <div id="pension-percent-section" class="hidden ml-8">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Pension Contribution (%)</label>
                                <input type="number" id="pension-percent" min="1" max="4" step="0.1" placeholder="1 - 4" class="mt-1 border rounded px-3 py-1 text-sm w-32">
                                <div class="text-xs text-gray-500 mt-1">Annual cost = percentage Ã— 13.92 Ã— gross salary</div>
    
                                <div id="pension-percent-error" class="error-message hidden">Enter 1â€“4%</div>
                            </div>
                            
                            <div class="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Accident Insurance</span>
                                    <p class="text-sm text-gray-600">€20/month</p>
                                </div>
                                <input type="checkbox" id="accident-insurance" class="w-5 h-5 text-blue-600" checked disabled>
                            </div>
    
                            <div id="representation-section" class="hidden flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Representation Allowance</span>
                                    <p class="text-sm text-gray-600">Max €250/month (Onsite/Hybrid only)</p>
                                    <input type="number" id="representation-amount" class="mt-2 border rounded px-3 py-1 text-sm w-32 hidden" placeholder="€/month (0â€“250)" min="0" max="250" step="0.01">
                                    <div id="representation-amount-error" class="error-message hidden">Enter a monthly amount up to €250</div>
                                </div>
                                <input type="checkbox" id="representation" class="w-5 h-5 text-blue-600">
                            </div>
    
                            <h4 class="mt-6 mb-2 text-md font-semibold text-gray-700">Transport & Mobility</h4>
                            <div id="parking-section" class="hidden flex items-center justify-between p-4 border rounded-lg disabled">
                                <div>
                                    <span class="font-medium">Parking Subscription</span>
                                    <p class="text-sm text-gray-600">Monthly parking allowance (only with company car)</p>
                                </div>
                                <input type="checkbox" id="parking-subscription" class="w-5 h-5 text-blue-600" disabled>
                            </div>
    
                            <div id="public-transport-section" class="flex items-center justify-between p-4 border rounded-lg disabled">
                                <div>
                                    <span class="font-medium">Public Transport Reimbursement</span>
                                    <p class="text-sm text-gray-600">100% of actual cost (enter monthly amount)</p>
                                    <input type="number" id="public-transport-amount" class="mt-2 border rounded px-3 py-1 text-sm w-40 hidden" placeholder="€/month" min="0" step="0.01" disabled>
                                    <div id="public-transport-amount-error" class="error-message hidden">Enter a positive monthly amount</div>
                                </div>
                                <input type="checkbox" id="public-transport" class="w-5 h-5 text-blue-600" disabled>
                            </div>
    
                            <div id="car-wash-section" class="hidden flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Car Wash</span>
                                    <p class="text-sm text-gray-600">Max €10/month (only with company car)</p>
                                    <input type="number" id="car-wash-amount" class="mt-2 border rounded px-3 py-1 text-sm w-40 hidden" placeholder="€/month (max 10)" min="0" max="10" step="0.01" disabled>
                                    <div id="car-wash-amount-error" class="error-message hidden">Enter a positive monthly amount up to €10</div>
                                </div>
                                <input type="checkbox" id="car-wash" class="w-5 h-5 text-blue-600">
                            </div>
    
                            <h4 class="mt-6 mb-2 text-md font-semibold text-gray-700">Home Office & Equipment</h4>
                            <div id="home-office-section" class="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Home Office Allowance</span>
                                    <p class="text-sm text-gray-600">€148.73/month (includes heating/electricity)</p>
                                </div>
                                <input type="checkbox" id="home-office-allowance" class="w-5 h-5 text-blue-600">
                            </div>
    
                            <div id="office-equipment-section" class="hidden flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Office Equipment</span>
                                    <p class="text-sm text-gray-600">For home/remote workers</p>
                                    <select id="equipment-type" class="mt-2 border rounded px-3 py-1 text-sm hidden" disabled>
                                        <option value="">Select option...</option>
                                        <option value="500">One-time €500</option>
                                        <option value="20">Monthly €20</option>
                                    </select>
                                    <div id="equipment-type-error" class="error-message hidden">Select equipment option</div>
                                </div>
                                <input type="checkbox" id="office-equipment" class="w-5 h-5 text-blue-600">
                            </div>
    
                            <div id="home-internet-section" class="hidden flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Home Internet</span>
                                    <p class="text-sm text-gray-600">Internet connection reimbursement (up to €20/month)</p>
                                    <input type="number" id="home-internet-amount" class="mt-2 border rounded px-3 py-1 text-sm w-40 hidden" placeholder="€/month (max 20)" min="0" max="20" step="0.01" disabled>
                                    <div id="home-internet-amount-error" class="error-message hidden">Enter a monthly amount up to €20</div>
                                </div>
                                <input type="checkbox" id="home-internet" class="w-5 h-5 text-blue-600">
                            </div>
    
                            <div id="phone-allowance-section" class="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Phone Allowance</span>
                                    <p class="text-sm text-gray-600">Reimbursement (up to €30/month)</p>
                                    <input type="number" id="phone-allowance-amount" class="mt-2 border rounded px-3 py-1 text-sm w-40 hidden" placeholder="€/month (max 30)" min="0" max="30" step="0.01" disabled>
                                    <div id="phone-allowance-amount-error" class="error-message hidden">Enter a monthly amount up to €30</div>
                                </div>
                                <input type="checkbox" id="phone-allowance" class="w-5 h-5 text-blue-600">
                            </div>
    
                            <div id="printer-scanner-section" class="hidden flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <span class="font-medium">Printer/Scanner Allowance</span>
                                    <p class="text-sm text-gray-600">One-time allowance ( €50)</p>
                                </div>
                                <input type="checkbox" id="printer-scanner" class="w-5 h-5 text-blue-600">
                            </div>
    
                            <div id="year-end-bonus-section" class="flex items-center justify-between p-4 border rounded-lg disabled">
                                <div>
                                    <span class="font-medium">Year-End Bonus (CAO 90)</span> 
                                    <p class="text-sm text-gray-600">Cost per year: €3,948 (Non-Taxable, max 2025)</p>
                                    <div class="text-xs text-gray-500">As per CAO 90 bonus rules; must comply with bonus plan; can be combined with all benefits.</div>
                                </div>
                                <input type="checkbox" id="year-end-bonus" class="w-5 h-5 text-blue-600" disabled>
                            </div>
    
                            <div id="training-budget-section" class="flex items-center justify-between p-4 border rounded-lg disabled">
                                <div>
                                    <span class="font-medium">Training Budget</span>
                                    <p class="text-sm text-gray-600">Unlimited if justified (avg €500/year) â€” Annual</p>
                                    <div class="text-xs text-gray-500">Must be related to job. Optional.</div>
                                    <div id="training-budget-range" class="text-xs text-gray-500">Avg €500/year (entering amount disabled)</div>
                                </div>
                                <input type="checkbox" id="training-budget" class="w-5 h-5 text-blue-600" disabled>
                            </div>
    
                            <div id="it-equipment-section" class="flex items-center justify-between p-4 border rounded-lg disabled">
                                <div>
                                    <span class="font-medium">IT Equipment Purchase Subsidy</span>
                                    <p class="text-sm text-gray-600">One-time amount (e.g., €500)</p>
                                    <input type="number" id="it-equipment-amount" class="mt-2 border rounded px-3 py-1 text-sm w-40 hidden" placeholder="€500 one-time" min="0" step="0.01" disabled>
                                    <div id="it-equipment-amount-error" class="error-message hidden">Enter a positive amount</div>
                                </div>
                                <input type="checkbox" id="it-equipment" class="w-5 h-5 text-blue-600" disabled>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Net Extra Benefits (Compact Table) -->
                <div id="benefits-chart-section" class="mt-8 w-full max-w-xs">
                    <h3 class="text-sm font-semibold text-gray-800 mb-2 text-left">Net Extra Benefit Provided</h3>
                    <div class="overflow-hidden rounded-lg border border-gray-200">
                        <table class="w-full text-xs">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="text-left py-1 px-2 text-gray-700 font-medium text-xs">Benefit</th>
                                    <th class="text-right py-1 px-2 text-gray-700 font-medium text-xs">€ / month</th>
                                </tr>
                            </thead>
                            <tbody id="benefits-table-body"></tbody>
                        </table>
                    </div>
                    <div class="text-left text-xs text-gray-700 mt-2">
                        Total Net Extra Benefits: <span id="benefits-chart-total">€0</span> / month
                    </div>
                </div>
    
                <div class="text-center mt-8 space-x-4">
                    <button id="previous-phase3" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium">
                        Previous
                    </button>
                    <button id="continue-phase3" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                        Continue to Target Margin
                    </button>
                </div>
            </div>
    
            <!-- Phase 4: Target Margin -->
            <div id="phase4" class="hidden bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Phase 4: Target Margin</h2>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-4">Select Target Margin</label>
                    <div class="space-y-4">
                        <label class="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                            <input type="radio" name="margin-type" id="margin-standard" class="w-5 h-5 text-blue-600" value="standard">
                            <div>
                                <div class="font-medium">Standard margin</div>
                                <div class="text-sm text-gray-600">€36,000/year</div>
                            </div>
                        </label>
                        <label class="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                            <input type="radio" name="margin-type" id="margin-payrolling" class="w-5 h-5 text-blue-600" value="payrolling">
                            <div>
                                <div class="font-medium">Payrolling margin</div>
                                <div class="text-sm text-gray-600">€24000/year (fixed)</div>
                            </div>
                        </label>
                        <label class="flex items-center justify-between border rounded-lg p-4 cursor-pointer">
                            <div class="flex items-center space-x-3">
                                <input type="radio" name="margin-type" id="margin-manual" class="w-5 h-5 text-blue-600" value="manual">
                                <div>
                                    <div class="font-medium">Manual margin</div>
                                    <div class="text-sm text-gray-600">No minimum (€/year)</div>
                                </div>
                            </div>
                            <input type="number" id="manual-margin-amount" class="mt-2 border rounded px-3 py-2 text-sm w-40" placeholder="€/year" step="100" disabled>
                        </label>
                    </div>
                    <div id="margin-error" class="error-message hidden">Please select a margin option or enter a value</div>
                </div>
    
                <div class="text-center mt-8 space-x-4">
                    <button id="previous-phase4" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium">
                        Previous
                    </button>
                    <button id="calculate-output" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium">
                        Calculate Final Output
                    </button>
                </div>
            </div>
    
            <!-- Phase 5: Output -->
            <div id="phase5" class="hidden bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Final Result</h2>
                
                <div id="sales-team" class="mb-8">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">Sales Team</h3>
                    <table class="w-full text-sm">
                        <tbody>
                            <tr class="border-b">
                                <td class="py-2">Total Cost per Year</td>
                                <td class="py-2 text-right"><span id="sales-total-cost-year">€0</span></td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-2">Target Margin</td>
                                <td class="py-2 text-right"><span id="sales-selected-margin">€0/year</span></td>
                            </tr>
                            <tr>
                                <td class="py-2">Requested Daily Rate</td>
                                <td class="py-2 text-right"><span id="sales-daily-rate">€0</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="grid md:grid-cols-2 gap-8">
                    <!-- Candidate Offer -->
                    <div class="md:col-span-2 max-w-3xl mx-auto rounded-xl border border-gray-200 p-6 bg-white">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">Candidate Offer</h3>
                        <table id="candidate-offer-table" class="w-full text-sm">
                            <tbody>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Monthly Gross Salary</td>
                                    <td class="py-2 text-right"><span id="monthly-gross" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Annual Gross Salary</td>
                                    <td class="py-2 text-right"><span id="annual-gross" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Double Holiday Pay</td>
                                    <td class="py-2 text-right"><span id="candidate-double-holiday" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">13th Month Payment</td>
                                    <td class="py-2 text-right"><span id="thirteenth-month" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Net Per Month (Excl. Benefits)</td>
                                    <td class="py-2 text-right"><span id="net-excl-benefits" class="font-medium">€0</span></td>
                                </tr>
                                <tr id="mobility-display" class="border-b hidden">
                                    <td class="py-2 text-gray-600">Mobility Per Month</td>
                                    <td class="py-2 text-right"><span id="mobility-value" class="font-medium">€0</span></td>
                                </tr>
                                
                                <tr id="commute-monthly-display" class="border-b hidden">
                                    <td class="py-2 text-gray-600">Car Wash</td>
                                    <td class="py-2 text-right"><span id="commute-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b hidden">
                                    <td class="py-2 text-gray-600">Total Net Per Month</td>
                                    <td class="py-2 text-right"><span id="total-net-per-month" class="font-medium">€0</span></td>
                                </tr>
                            </tbody>
                            <!-- Dynamic: Net-included benefits inside the same table -->
                            <tbody id="candidate-offer-net-benefits" class="hidden"></tbody>
                            <!-- Summary row to appear last in the table -->
                            <tbody>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Net Per Month (Incl. Benefits)</td>
                                    <td class="py-2 text-right"><span id="net-incl-benefits" class="font-medium">€0</span></td>
                                </tr>
                            </tbody>
                        </table>
                        <!-- Selected Net Benefits (Table) moved inside the main offer table; keeping container for modal clone only -->
                        <div id="selected-benefits-section" class="mt-4 hidden">
                            <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                                <table class="w-full text-xs">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="text-left py-2 px-3 text-gray-700 font-medium text-xs">Extra Benefits</th>
                                            <th class="text-right py-2 px-3 text-gray-700 font-medium text-xs">€ / month / working day / year</th>
                                        </tr>
                                    </thead>
                                    <tbody id="selected-benefits-body"></tbody>
                                </table>
                            </div>
                        </div>
                        <div class="text-center space-x-2">
                            <button id="open-offer-modal" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm mt-4">Show Offer</button>
                        </div>
                    </div>
    
                    <!-- AGAD Include Package -->
                    <div id="agad-section" class="hidden">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">AGAD Salary Breakdown</h3>
                        <table id="agad-table" class="w-full text-sm">
                            <tbody>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Margin</td>
                                    <td class="py-2 text-right"><span id="package-type" class="font-medium">-</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Monthly Gross Salary</td>
                                    <td class="py-2 text-right"><span id="agad-monthly-gross" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Double Holiday Pay</td>
                                    <td class="py-2 text-right"><span id="double-holiday" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Annual Gross Salary</td>
                                    <td class="py-2 text-right"><span id="agad-annual-gross" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Annual Gross w/o Holiday</td>
                                    <td class="py-2 text-right"><span id="annual-gross-no-holiday" class="font-medium">€0</span></td>
                                </tr>
                                
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Group Insurance (Pension)</td>
                                    <td class="py-2 text-right"><span id="group-insurance-status" class="font-medium">No</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Accident Insurance</td>
                                    <td class="py-2 text-right"><span id="collective-benefits-status" class="font-medium">No</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600"><div>Meal Voucher (per working day)</div><div class="text-xs text-gray-500">Per day: <span id="meal-voucher-per-day">€8</span></div></td>
                                    <td class="py-2 text-right"><span id="meal-voucher-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">ECO Voucher (per year)</td>
                                    <td class="py-2 text-right"><span id="eco-voucher-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Work From Home Allowance</td>
                                    <td class="py-2 text-right"><span id="home-office-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Hospitalization Premium</td>
                                    <td class="py-2 text-right"><span id="dkv-hospitalization-status" class="font-medium">Included</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Internet Allowance</td>
                                    <td class="py-2 text-right"><span id="internet-allowance-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Phone Allowance</td>
                                    <td class="py-2 text-right"><span id="phone-allowance-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Representation Allowance(Per Month)</td>
                                    <td class="py-2 text-right"><span id="representation-allowance-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Net Salary (Excl. Benefits)</td>
                                    <td class="py-2 text-right"><span id="net-salary-per-month" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2 text-gray-600">Net Benefits Per Month</td>
                                    <td class="py-2 text-right"><span id="net-benefits-per-month" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b hidden">
                                    <td class="py-2 text-gray-600">Mobility Per Month</td>
                                    <td class="py-2 text-right"><span id="agad-mobility-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b hidden" id="agad-mobility-budget-row">
                                    <td class="py-2 text-gray-600">Mobility Budget (Monthly)</td>
                                    <td class="py-2 text-right"><span id="agad-mobility-budget-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr class="border-b" id="agad-commute-row">
                                    <td class="py-2 text-gray-600">Car Wash</td>
                                    <td class="py-2 text-right"><span id="agad-commute-monthly" class="font-medium">€0</span></td>
                                </tr>
                                <tr>
                                    <td class="py-2 text-gray-600">Total Net Per Month</td>
                                    <td class="py-2 text-right"><span id="net-earnings-monthly" class="font-medium">€0</span></td>
                                </tr>
                                
                                <tr class="border-b font-semibold">
                                    <td class="py-2">Total Salary Cost</td>
                                    <td class="py-2 text-right"><span id="total-salary-cost">€0</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
    
                <div class="text-center mt-8 space-x-4">
                    <button id="previous-phase5" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium">
                        Previous
                    </button>
                    <button id="start-over" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium">
                        Start Over
                    </button>
                    <button id="export-calculation" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                        Export PDF
                    </button>
                </div>
            </div>
        </div>
        
        <!-- AGAD Salary Breakdown Modal -->
        <div id="agad-modal" class="fixed inset-0 bg-black/50 z-50 hidden animate-fade-in">
            <div class="bg-white rounded-xl shadow-xl max-w-5xl w-11/12 mx-auto my-12 p-6 relative animate-fade-in animate-scale-in">
                <button id="close-agad-modal" class="absolute top-3 right-3 text-gray-600 hover:text-gray-900" aria-label="Close">✕</button>
                <h3 class="text-xl font-semibold text-gray-800 mb-4">AGAD Salary Breakdown</h3>
                <div id="agad-modal-body" class="max-h-[80vh] overflow-y-auto space-y-4 pr-2"></div>
            </div>
        </div>

        <!-- Extra Benefits Modal -->
        <div id="benefits-modal" class="fixed inset-0 bg-black/50 z-50 hidden animate-fade-in">
            <div class="relative bg-white rounded-lg shadow-lg max-w-2xl w-[90%] mx-auto mt-20 p-6">
                <button id="close-benefits-modal" class="absolute top-3 right-3 text-gray-600 hover:text-gray-900" aria-label="Close">✕</button>
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Extra Benefits</h3>
                <div id="benefits-modal-body" class="max-h-[80vh] overflow-y-auto space-y-4 pr-2"></div>
            </div>
        </div>
`

export default function App() {
  useEffect(() => {
    initCalculator()
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: legacyMarkup }} />
}




