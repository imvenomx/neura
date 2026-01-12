/* =========================
Voice Agent Selector
=========================== */

document.addEventListener('DOMContentLoaded', () => {
  const agentPills = document.querySelectorAll('.agent-pill');

  if (agentPills.length === 0) return;

  agentPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      // Remove active class from all pills
      agentPills.forEach((p) => p.classList.remove('active'));

      // Add active class to clicked pill
      pill.classList.add('active');

      // Get the selected agent type (for future implementation)
      const agentType = pill.dataset.agent;
      console.log('Selected agent:', agentType);
    });
  });
});
