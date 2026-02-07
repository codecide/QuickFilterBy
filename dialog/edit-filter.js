(async function() {
  'use strict';
  
  const filterValueInput = document.getElementById('filterValue');
  const applyButton = document.getElementById('applyButton');
  const cancelButton = document.getElementById('cancelButton');
  
  let filterData = null;
  let currentTab = null;
  
  // Get filter data from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const filterType = urlParams.get('type');
  const value = urlParams.get('value');
  
  if (!filterType || value === null) {
    await browser.runtime.sendMessage({
      action: 'closeFilterDialog',
      error: 'Missing filter parameters'
    });
    return;
  }
  
  filterData = {
    type: filterType,
    value: decodeURIComponent(value)
  };
  
  // Get current mail tab
  currentTab = await browser.tabs.query({ currentWindow: true, active: true });
  currentTab = currentTab[0];
  
  // Set initial value in input
  filterValueInput.value = filterData.value;
  filterValueInput.focus();
  filterValueInput.select();
  
  // Handle Enter key
  filterValueInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      await applyFilter();
    } else if (e.key === 'Escape') {
      await cancel();
    }
  });
  
  // Handle Apply button
  applyButton.addEventListener('click', async () => {
    await applyFilter();
  });
  
  // Handle Cancel button
  cancelButton.addEventListener('click', async () => {
    await cancel();
  });
  
  async function applyFilter() {
    const editedValue = filterValueInput.value.trim();
    
    if (!editedValue) {
      alert('Please enter a filter value');
      return;
    }
    
    try {
      // Send message to background script to apply filter
      await browser.runtime.sendMessage({
        action: 'applyEditedFilter',
        filter: {
          type: filterData.type,
          value: editedValue
        },
        tabId: currentTab.id
      });
      
      // Close the dialog window
      window.close();
    } catch (error) {
      console.error('Failed to apply filter:', error);
      alert('Failed to apply filter: ' + error.message);
    }
  }
  
  async function cancel() {
    try {
      // Send cancel message to background script
      await browser.runtime.sendMessage({
        action: 'cancelFilterDialog'
      });
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
    
    // Close the dialog window
    window.close();
  }
  
  // Auto-focus and select text on load
  window.addEventListener('load', () => {
    filterValueInput.focus();
    filterValueInput.select();
  });
})();
