import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const distDir = path.join(frontendRoot, 'dist');

const PORT = parseInt(process.env.PORT || '3000', 10);
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

/**
 * Proxy API requests directly to the backend service
 */
function handleApiProxy(req, res) {
  try {
    const targetUrl = new URL(req.url, BACKEND_URL);
    const proxyOptions = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.host,
      },
    };

    const proxyReq = http.request(proxyOptions, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Frontend Proxy Error] Failed to connect to ${BACKEND_URL}:`, err.message);
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          error: {
            code: 'BACKEND_UNAVAILABLE',
            message: `Could not reach backend at ${BACKEND_URL}. Ensure backend is running.`,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        })
      );
    });

    req.pipe(proxyReq);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: err.message } }));
  }
}

/**
 * Render the full personal portfolio HTML page
 */
function renderPortfolioPage() {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Rivera | Senior Fullstack Engineer & Cloud Architect</title>
  <meta name="description" content="Dedicated software engineer specializing in scalable web systems, clean architecture, and modern fullstack development with TypeScript.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: { DEFAULT: '#3b82f6', hover: '#2563eb', light: '#dbeafe' },
            success: { DEFAULT: '#10b981', bg: '#ecfdf5' },
            error: { DEFAULT: '#ef4444', bg: '#fef2f2' },
            warning: { DEFAULT: '#f59e0b', bg: '#fffbeb' },
            neutral: {
              title: '#0f172a',
              secondary: '#475569',
              placeholder: '#94a3b8',
              divider: '#e2e8f0',
            },
            container: '#ffffff',
            layout: '#f8fafc',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-layout text-neutral-title font-sans antialiased selection:bg-primary selection:text-white">

  <!-- Navbar -->
  <header class="sticky top-0 z-50 bg-container/95 backdrop-blur border-b border-neutral-divider">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="#" class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-sm">AR</span>
        <div>
          <div class="font-bold text-sm tracking-tight text-neutral-title">Alex Rivera</div>
          <div class="text-xs text-neutral-secondary">Senior Fullstack Engineer</div>
        </div>
      </a>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-secondary">
        <a href="#about" class="hover:text-primary transition">About</a>
        <a href="#skills" class="hover:text-primary transition">Skills</a>
        <a href="#projects" class="hover:text-primary transition">Projects</a>
        <a href="#contact" class="hover:text-primary transition">Contact</a>
        <a href="#contact" class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover font-semibold transition shadow-sm">Hire Me</a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="py-20 md:py-28 px-4 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
    <div class="flex-1 space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-bg text-success text-xs font-semibold border border-success/20">
        <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
        Available for Hire & Contracting
      </div>
      <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-title leading-tight">
        Building Resilient, Scalable Web Systems & Cloud Architectures
      </h1>
      <p class="text-lg text-neutral-secondary leading-relaxed">
        I am Alex Rivera, a Senior Fullstack Engineer based in San Francisco, CA. I specialize in TypeScript, modern distributed microservices, and high-performance UI engineering.
      </p>
      <div class="flex flex-wrap gap-4 pt-2">
        <a href="#projects" class="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover shadow-md transition">View Projects</a>
        <a href="#contact" class="px-6 py-3 rounded-lg bg-container border border-neutral-divider text-neutral-title font-semibold hover:bg-neutral-50 transition">Get in Touch</a>
      </div>
    </div>
    <div class="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-container ring-1 ring-neutral-divider">
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" alt="Alex Rivera" class="w-full h-full object-cover">
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="py-20 bg-container border-y border-neutral-divider">
    <div class="max-w-6xl mx-auto px-4 space-y-12">
      <div class="text-center max-w-2xl mx-auto">
        <span class="text-xs uppercase tracking-wider font-bold text-primary">About Me</span>
        <h2 class="text-3xl font-bold text-neutral-title mt-2">Passionate About Engineering Excellence</h2>
      </div>
      <div class="grid md:grid-cols-4 gap-6">
        <div class="p-6 rounded-xl bg-layout border border-neutral-divider space-y-2">
          <div class="text-2xl font-bold text-primary">7+ Years</div>
          <div class="font-semibold text-neutral-title">Production Experience</div>
          <p class="text-xs text-neutral-secondary">Delivering mission-critical fullstack platforms and APIs.</p>
        </div>
        <div class="p-6 rounded-xl bg-layout border border-neutral-divider space-y-2">
          <div class="text-2xl font-bold text-primary">Clean Architecture</div>
          <div class="font-semibold text-neutral-title">Layered Design</div>
          <p class="text-xs text-neutral-secondary">Controller-Service-Repository patterns with strict separation of concerns.</p>
        </div>
        <div class="p-6 rounded-xl bg-layout border border-neutral-divider space-y-2">
          <div class="text-2xl font-bold text-primary">Automated Quality</div>
          <div class="font-semibold text-neutral-title">Test-Driven</div>
          <p class="text-xs text-neutral-secondary">Comprehensive unit, integration, and E2E test suites with 0 regressions.</p>
        </div>
        <div class="p-6 rounded-xl bg-layout border border-neutral-divider space-y-2">
          <div class="text-2xl font-bold text-primary">Cloud & DevOps</div>
          <div class="font-semibold text-neutral-title">Containerized</div>
          <p class="text-xs text-neutral-secondary">Docker Compose orchestration and production-ready CI/CD automation.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Skills Section -->
  <section id="skills" class="py-20 px-4 max-w-6xl mx-auto space-y-12">
    <div class="text-center max-w-2xl mx-auto">
      <span class="text-xs uppercase tracking-wider font-bold text-primary">Expertise</span>
      <h2 class="text-3xl font-bold text-neutral-title mt-2">Technical Skills & Proficiencies</h2>
    </div>
    <div id="skills-grid" class="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div class="p-6 rounded-xl bg-container border border-neutral-divider shadow-sm space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-bold text-neutral-title">TypeScript</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Languages</span>
        </div>
        <div class="w-full bg-neutral-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full" style="width: 95%"></div>
        </div>
        <span class="text-xs text-neutral-secondary">95% Proficiency</span>
      </div>
      <div class="p-6 rounded-xl bg-container border border-neutral-divider shadow-sm space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-bold text-neutral-title">React / Next.js</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Frontend</span>
        </div>
        <div class="w-full bg-neutral-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full" style="width: 92%"></div>
        </div>
        <span class="text-xs text-neutral-secondary">92% Proficiency</span>
      </div>
      <div class="p-6 rounded-xl bg-container border border-neutral-divider shadow-sm space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-bold text-neutral-title">Node.js / Express</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Backend</span>
        </div>
        <div class="w-full bg-neutral-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full" style="width: 94%"></div>
        </div>
        <span class="text-xs text-neutral-secondary">94% Proficiency</span>
      </div>
      <div class="p-6 rounded-xl bg-container border border-neutral-divider shadow-sm space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-bold text-neutral-title">PostgreSQL</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Database</span>
        </div>
        <div class="w-full bg-neutral-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full" style="width: 88%"></div>
        </div>
        <span class="text-xs text-neutral-secondary">88% Proficiency</span>
      </div>
      <div class="p-6 rounded-xl bg-container border border-neutral-divider shadow-sm space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-bold text-neutral-title">Docker & Compose</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">DevOps</span>
        </div>
        <div class="w-full bg-neutral-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full" style="width: 85%"></div>
        </div>
        <span class="text-xs text-neutral-secondary">85% Proficiency</span>
      </div>
      <div class="p-6 rounded-xl bg-container border border-neutral-divider shadow-sm space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-bold text-neutral-title">Tailwind CSS</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Frontend</span>
        </div>
        <div class="w-full bg-neutral-100 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full" style="width: 90%"></div>
        </div>
        <span class="text-xs text-neutral-secondary">90% Proficiency</span>
      </div>
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="py-20 bg-container border-y border-neutral-divider">
    <div class="max-w-6xl mx-auto px-4 space-y-12">
      <div class="text-center max-w-2xl mx-auto">
        <span class="text-xs uppercase tracking-wider font-bold text-primary">Portfolio</span>
        <h2 class="text-3xl font-bold text-neutral-title mt-2">Featured Engineering Projects</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="rounded-xl border border-neutral-divider overflow-hidden bg-layout flex flex-col">
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Telemetry Suite" class="h-48 w-full object-cover">
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 class="font-bold text-lg text-neutral-title">CloudTelemetry Observability</h3>
              <p class="text-sm text-neutral-secondary mt-2">Real-time distributed tracing and metrics platform built for multi-cloud Kubernetes clusters with sub-second query latency.</p>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="text-xs px-2 py-1 rounded bg-container border border-neutral-divider text-neutral-secondary font-mono">TypeScript</span>
                <span class="text-xs px-2 py-1 rounded bg-container border border-neutral-divider text-neutral-secondary font-mono">PostgreSQL</span>
              </div>
            </div>
            <div class="pt-4 flex gap-4 border-t border-neutral-divider">
              <a href="https://demo.example.com/telemetry" target="_blank" class="text-sm font-semibold text-primary hover:underline">Live Demo &rarr;</a>
              <a href="https://github.com/example/cloud-telemetry" target="_blank" class="text-sm font-semibold text-neutral-secondary hover:underline">GitHub</a>
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-neutral-divider overflow-hidden bg-layout flex flex-col">
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80" alt="AI Reviewer" class="h-48 w-full object-cover">
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 class="font-bold text-lg text-neutral-title">AI-Powered Code Reviewer</h3>
              <p class="text-sm text-neutral-secondary mt-2">Automated GitHub pull request review bot utilizing LLM heuristics, AST diffing, and automated test coverage feedback.</p>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="text-xs px-2 py-1 rounded bg-container border border-neutral-divider text-neutral-secondary font-mono">Next.js</span>
                <span class="text-xs px-2 py-1 rounded bg-container border border-neutral-divider text-neutral-secondary font-mono">Express</span>
              </div>
            </div>
            <div class="pt-4 flex gap-4 border-t border-neutral-divider">
              <a href="https://demo.example.com/reviewer" target="_blank" class="text-sm font-semibold text-primary hover:underline">Live Demo &rarr;</a>
              <a href="https://github.com/example/code-reviewer" target="_blank" class="text-sm font-semibold text-neutral-secondary hover:underline">GitHub</a>
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-neutral-divider overflow-hidden bg-layout flex flex-col">
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80" alt="Task Engine" class="h-48 w-full object-cover">
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 class="font-bold text-lg text-neutral-title">High-Throughput Task Engine</h3>
              <p class="text-sm text-neutral-secondary mt-2">Reliable background job orchestration engine supporting cron intervals, dead-letter queues, and real-time progress tracking.</p>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="text-xs px-2 py-1 rounded bg-container border border-neutral-divider text-neutral-secondary font-mono">Node.js</span>
                <span class="text-xs px-2 py-1 rounded bg-container border border-neutral-divider text-neutral-secondary font-mono">Redis</span>
              </div>
            </div>
            <div class="pt-4 flex gap-4 border-t border-neutral-divider">
              <a href="https://demo.example.com/engine" target="_blank" class="text-sm font-semibold text-primary hover:underline">Live Demo &rarr;</a>
              <a href="https://github.com/example/task-engine" target="_blank" class="text-sm font-semibold text-neutral-secondary hover:underline">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Form Section -->
  <section id="contact" class="py-20 px-4 max-w-3xl mx-auto space-y-8">
    <div class="text-center space-y-2">
      <span class="text-xs uppercase tracking-wider font-bold text-primary">Inquiries</span>
      <h2 class="text-3xl font-bold text-neutral-title">Get In Touch</h2>
      <p class="text-sm text-neutral-secondary">Have an engineering project or role in mind? Send me a message below.</p>
    </div>

    <div id="contact-alert" class="hidden p-4 rounded-xl text-sm font-medium"></div>

    <form id="contact-form" class="bg-container p-8 rounded-2xl border border-neutral-divider shadow-sm space-y-5">
      <div>
        <label for="name" class="block text-sm font-semibold text-neutral-title mb-1">Your Name *</label>
        <input type="text" id="name" name="name" required minlength="2" maxlength="120" placeholder="Jane Doe"
          class="w-full px-4 py-2.5 rounded-lg border border-neutral-divider focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
        <p id="name-error" class="text-xs text-error mt-1 hidden"></p>
      </div>

      <div>
        <label for="email" class="block text-sm font-semibold text-neutral-title mb-1">Your Email Address *</label>
        <input type="email" id="email" name="email" required maxlength="255" placeholder="jane@example.com"
          class="w-full px-4 py-2.5 rounded-lg border border-neutral-divider focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
        <p id="email-error" class="text-xs text-error mt-1 hidden"></p>
      </div>

      <div>
        <label for="subject" class="block text-sm font-semibold text-neutral-title mb-1">Subject (Optional)</label>
        <input type="text" id="subject" name="subject" maxlength="200" placeholder="Project Inquiry / Job Opportunity"
          class="w-full px-4 py-2.5 rounded-lg border border-neutral-divider focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
      </div>

      <div>
        <label for="message" class="block text-sm font-semibold text-neutral-title mb-1">Message *</label>
        <textarea id="message" name="message" rows="5" required minlength="10" maxlength="2000" placeholder="Tell me about your project, team, or opportunity..."
          class="w-full px-4 py-2.5 rounded-lg border border-neutral-divider focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"></textarea>
        <div class="flex justify-between items-center text-xs text-neutral-secondary mt-1">
          <p id="message-error" class="text-error hidden"></p>
          <span id="char-counter">0 / 2000</span>
        </div>
      </div>

      <button type="submit" id="submit-btn"
        class="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover shadow-md transition flex items-center justify-center gap-2">
        <span>Send Message</span>
      </button>
    </form>
  </section>

  <!-- Footer -->
  <footer class="py-8 bg-container border-t border-neutral-divider text-center text-xs text-neutral-secondary">
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>&copy; 2026 Alex Rivera. All rights reserved.</div>
      <div class="flex gap-6">
        <a href="https://github.com" target="_blank" class="hover:text-primary transition">GitHub</a>
        <a href="https://linkedin.com" target="_blank" class="hover:text-primary transition">LinkedIn</a>
        <a href="https://twitter.com" target="_blank" class="hover:text-primary transition">Twitter</a>
      </div>
    </div>
  </footer>

  <script>
    // Client-side contact form handler
    const form = document.getElementById('contact-form');
    const alertBox = document.getElementById('contact-alert');
    const submitBtn = document.getElementById('submit-btn');
    const messageInput = document.getElementById('message');
    const charCounter = document.getElementById('char-counter');

    messageInput.addEventListener('input', () => {
      charCounter.textContent = messageInput.value.length + ' / 2000';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');
      alertBox.className = 'p-4 rounded-xl text-sm font-medium hidden';

      const payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim() || undefined,
        message: document.getElementById('message').value.trim()
      };

      if (!payload.name || payload.name.length < 2) {
        showAlert('Name must be at least 2 characters long.', 'error');
        return;
      }
      if (!payload.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(payload.email)) {
        showAlert('Please enter a valid email address.', 'error');
        return;
      }
      if (!payload.message || payload.message.length < 10) {
        showAlert('Message must be at least 10 characters long.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⟳</span> Sending...';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 201 && data.success) {
          showAlert('Thank you! Your message has been sent successfully. Tracking ID: ' + (data.data?.id || 'Submitted'), 'success');
          form.reset();
          charCounter.textContent = '0 / 2000';
        } else {
          const errMsg = data.error?.message || 'Failed to submit inquiry. Please try again.';
          showAlert(errMsg, 'error');
        }
      } catch (err) {
        showAlert('Network error: ' + err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span>';
      }
    });

    function showAlert(text, type) {
      alertBox.textContent = text;
      alertBox.classList.remove('hidden');
      if (type === 'success') {
        alertBox.className = 'p-4 rounded-xl text-sm font-medium bg-success-bg text-success border border-success/20';
      } else {
        alertBox.className = 'p-4 rounded-xl text-sm font-medium bg-error-bg text-error border border-error/20';
      }
    }
  </script>
</body>
</html>
`;
}

/**
 * Main HTTP Server
 */
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. API routes -> proxy to backend service
  if (pathname.startsWith('/api/')) {
    return handleApiProxy(req, res);
  }

  // 2. Health check
  if (pathname === '/health' || pathname === '/api-health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        status: 'UP',
        service: 'portfolio-frontend',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      })
    );
  }

  // 3. Static build manifest
  if (pathname === '/build-manifest.json') {
    const manifestPath = path.join(distDir, 'build-manifest.json');
    if (fs.existsSync(manifestPath)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return fs.createReadStream(manifestPath).pipe(res);
    }
  }

  // 4. Default / HTML route
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  return res.end(renderPortfolioPage());
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🌐 Personal Portfolio Frontend running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Proxying /api/* requests to: ${BACKEND_URL}`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down frontend server gracefully...`);
  server.close(() => {
    console.log('Frontend server closed. Bye!');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default server;
