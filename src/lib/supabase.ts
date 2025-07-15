import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const trainers = [
  {
    id: 'engr-usman-ahmad',
    name: 'Engr. Usman Ahmad',
    title: 'Senior Cloud Solutions Architect & DevOps Expert',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Usman is a seasoned cloud architect with over 8 years of experience in designing and implementing scalable cloud solutions. He holds multiple AWS and Azure certifications and has helped over 2000 students achieve their cloud certification goals.',
    specializations: ['AWS', 'Azure', 'DevOps', 'Kubernetes', 'Terraform', 'CI/CD'],
    teachingPhilosophy: 'I believe in hands-on learning combined with real-world scenarios. My approach focuses on practical implementation rather than just theoretical knowledge, ensuring students are job-ready.',
    experience: [
      'Senior Cloud Solutions Architect at Tech Mahindra (5+ years)',
      'DevOps Lead at Systems Limited (3+ years)',
      'AWS Community Builder and Speaker',
      'Led cloud migration projects worth $2M+ for enterprise clients',
      'Designed and implemented CI/CD pipelines for 50+ applications'
    ],
    certifications: [
      'AWS Solutions Architect Professional',
      'AWS DevOps Engineer Professional',
      'Azure Solutions Architect Expert',
      'Certified Kubernetes Administrator (CKA)',
      'HashiCorp Certified: Terraform Associate',
      'Google Cloud Professional Cloud Architect'
    ],
    coursesTeaching: ['aws-3-in-1', 'devops-zero-to-hero', 'kubernetes-mastery'],
    successStats: {
      passRate: '98%',
      careerAdvancement: '95%',
      studentsmentored: 2000
    }
  },
  {
    id: 'sarah-khan',
    name: 'Sarah Khan',
    title: 'Cybersecurity Expert & Ethical Hacker',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Sarah is a certified ethical hacker and cybersecurity consultant with 6+ years of experience in penetration testing and security operations. She has conducted security assessments for major financial institutions and government organizations.',
    specializations: ['Ethical Hacking', 'Penetration Testing', 'Security Operations', 'Incident Response', 'Compliance'],
    teachingPhilosophy: 'Cybersecurity is not just about tools and techniques, but understanding the mindset of both attackers and defenders. I teach students to think like hackers to better protect systems.',
    experience: [
      'Senior Cybersecurity Consultant at Deloitte (4+ years)',
      'Penetration Tester at CyberSec Solutions (2+ years)',
      'Conducted 200+ security assessments',
      'Speaker at international cybersecurity conferences',
      'Published researcher in cybersecurity journals'
    ],
    certifications: [
      'Certified Ethical Hacker (CEH)',
      'Offensive Security Certified Professional (OSCP)',
      'Certified Information Systems Security Professional (CISSP)',
      'CompTIA Security+',
      'GIAC Penetration Tester (GPEN)',
      'Certified Information Security Manager (CISM)'
    ],
    coursesTeaching: ['cybersecurity-zero-to-hero', 'ethical-hacking-advanced'],
    successStats: {
      passRate: '96%',
      careerAdvancement: '92%',
      studentsmentored: 1500
    }
  },
  {
    id: 'ahmed-hassan',
    name: 'Ahmed Hassan',
    title: 'DevOps Automation Specialist',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Ahmed specializes in DevOps automation and infrastructure as code. With 7+ years of experience, he has implemented DevOps practices across various industries, helping organizations achieve faster deployment cycles and improved reliability.',
    specializations: ['Jenkins', 'Docker', 'Kubernetes', 'Ansible', 'GitLab CI/CD', 'Infrastructure as Code'],
    teachingPhilosophy: 'DevOps is a culture, not just tools. I focus on teaching the principles and practices that make teams more collaborative and efficient, backed by the right automation tools.',
    experience: [
      'DevOps Lead at Techlogix (5+ years)',
      'Senior DevOps Engineer at Netsol Technologies (2+ years)',
      'Implemented DevOps practices for 100+ projects',
      'Reduced deployment time by 80% across multiple organizations',
      'Mentored 50+ junior DevOps engineers'
    ],
    certifications: [
      'Docker Certified Associate',
      'Certified Kubernetes Administrator (CKA)',
      'Jenkins Certified Engineer',
      'Ansible Certified Specialist',
      'GitLab Certified CI/CD Specialist',
      'AWS Certified DevOps Engineer'
    ],
    coursesTeaching: ['devops-zero-to-hero', 'docker-containerization', 'kubernetes-mastery'],
    successStats: {
      passRate: '97%',
      careerAdvancement: '90%',
      studentsmentored: 1200
    }
  },
  {
    id: 'fatima-ali',
    name: 'Fatima Ali',
    title: 'Cloud Security Architect',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Fatima combines cloud expertise with cybersecurity knowledge, specializing in secure cloud architectures and compliance frameworks. She has designed security solutions for cloud environments serving millions of users.',
    specializations: ['Cloud Security', 'AWS Security', 'Azure Security', 'Compliance', 'Risk Assessment'],
    teachingPhilosophy: 'Security should be built into every layer of cloud architecture, not added as an afterthought. I teach students to design secure-by-default cloud solutions.',
    experience: [
      'Cloud Security Architect at IBM (4+ years)',
      'Security Consultant at PwC (3+ years)',
      'Designed security frameworks for Fortune 500 companies',
      'Led compliance initiatives for GDPR, SOX, and HIPAA',
      'Published expert in cloud security best practices'
    ],
    certifications: [
      'AWS Certified Security - Specialty',
      'Azure Security Engineer Associate',
      'Certified Cloud Security Professional (CCSP)',
      'Certified Information Systems Auditor (CISA)',
      'ISO 27001 Lead Auditor',
      'NIST Cybersecurity Framework Certified'
    ],
    coursesTeaching: ['aws-3-in-1', 'cybersecurity-zero-to-hero', 'cloud-security-mastery'],
    successStats: {
      passRate: '95%',
      careerAdvancement: '93%',
      studentsmentored: 800
    }
  }
];

export interface ContactSubmission {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  course_interest: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at?: string;
}

export interface EnrollmentSubmission {
  id?: number;
  course_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  learning_goals: string;
  is_free: boolean;
  status: 'pending' | 'enrolled' | 'payment_pending' | 'cancelled';
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  image: string;
  features: string[];
  price: number;
  is_free: boolean;
  modules?: Module[];
}

export interface Module {
  id: string;
  title: string;
  topics: string[];
  duration: string;
}

export const courses: Course[] = [
  {
    id: 'aws-3-in-1',
    title: 'AWS 3 in 1 (All Associate Certifications)',
    description: 'Master all three AWS Associate certifications - Solutions Architect, Developer, and SysOps Administrator in one comprehensive program with hands-on labs and real-world projects.',
    duration: '12-16 weeks',
    level: 'Beginner to Advanced',
    image: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Complete AWS Cloud Fundamentals & Core Services',
      'AWS Solutions Architect Associate Certification Prep',
      'AWS Developer Associate Certification Prep',
      'AWS SysOps Administrator Associate Certification Prep',
      'Hands-on Labs with Real AWS Environment',
      'Infrastructure as Code with CloudFormation',
      'AWS Security Best Practices & Implementation',
      'Cost Optimization Strategies & Monitoring',
      'Practice Exams & Certification Guidance',
      'Job Interview Preparation & Resume Building'
    ],
    price: 450,
    is_free: false,
    modules: [
      {
        id: 'aws-fundamentals',
        title: 'AWS Cloud Fundamentals',
        duration: '2 weeks',
        topics: [
          'Introduction to Cloud Computing',
          'AWS Global Infrastructure',
          'AWS Management Console & CLI',
          'AWS Identity and Access Management (IAM)',
          'AWS Billing and Cost Management'
        ]
      },
      {
        id: 'compute-services',
        title: 'AWS Compute Services',
        duration: '3 weeks',
        topics: [
          'Amazon EC2 - Virtual Servers in the Cloud',
          'AWS Lambda - Serverless Computing',
          'Amazon ECS & EKS - Container Services',
          'AWS Elastic Beanstalk - Application Deployment',
          'Auto Scaling and Load Balancing'
        ]
      },
      {
        id: 'storage-database',
        title: 'Storage & Database Services',
        duration: '3 weeks',
        topics: [
          'Amazon S3 - Object Storage Service',
          'Amazon EBS - Block Storage',
          'Amazon RDS - Relational Database Service',
          'Amazon DynamoDB - NoSQL Database',
          'Amazon ElastiCache - In-Memory Caching'
        ]
      },
      {
        id: 'networking-security',
        title: 'Networking & Security',
        duration: '2 weeks',
        topics: [
          'Amazon VPC - Virtual Private Cloud',
          'AWS Security Groups & NACLs',
          'AWS CloudFront - Content Delivery Network',
          'AWS Route 53 - DNS Service',
          'AWS Certificate Manager'
        ]
      },
      {
        id: 'monitoring-automation',
        title: 'Monitoring & Automation',
        duration: '2 weeks',
        topics: [
          'Amazon CloudWatch - Monitoring Service',
          'AWS CloudTrail - Audit and Compliance',
          'AWS CloudFormation - Infrastructure as Code',
          'AWS Systems Manager',
          'AWS Config - Configuration Management'
        ]
      }
    ]
  },
  {
    id: 'devops-zero-to-hero',
    title: 'DevOps Zero to Hero',
    description: 'Complete DevOps transformation journey from basics to advanced practices including CI/CD, containerization, orchestration, and cloud automation with industry best practices.',
    duration: '16-20 weeks',
    level: 'Beginner to Advanced',
    image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'DevOps Culture & Methodology Fundamentals',
      'Version Control with Git & Advanced Workflows',
      'CI/CD Pipeline Implementation with Jenkins',
      'Containerization with Docker & Best Practices',
      'Container Orchestration with Kubernetes',
      'Infrastructure as Code with Terraform & Ansible',
      'Monitoring & Logging with Prometheus & Grafana',
      'Cloud DevOps with AWS/Azure Integration',
      'Security in DevOps (DevSecOps Practices)',
      'Real-world Project Implementation'
    ],
    price: 500,
    is_free: false,
    modules: [
      {
        id: 'devops-fundamentals',
        title: 'DevOps Fundamentals & Culture',
        duration: '2 weeks',
        topics: [
          'Introduction to DevOps Philosophy',
          'DevOps vs Traditional IT Operations',
          'Agile and Lean Principles',
          'DevOps Toolchain Overview',
          'Building DevOps Culture in Organizations'
        ]
      },
      {
        id: 'version-control',
        title: 'Version Control & Collaboration',
        duration: '2 weeks',
        topics: [
          'Git Fundamentals and Advanced Commands',
          'GitHub/GitLab Workflows',
          'Branching Strategies (GitFlow, GitHub Flow)',
          'Code Review Best Practices',
          'Collaborative Development Workflows'
        ]
      },
      {
        id: 'cicd-pipelines',
        title: 'CI/CD Pipeline Implementation',
        duration: '4 weeks',
        topics: [
          'Continuous Integration Principles',
          'Jenkins Installation and Configuration',
          'Building Automated Testing Pipelines',
          'Deployment Automation Strategies',
          'Pipeline as Code with Jenkinsfile'
        ]
      },
      {
        id: 'containerization',
        title: 'Containerization with Docker',
        duration: '3 weeks',
        topics: [
          'Docker Architecture and Components',
          'Creating and Managing Docker Images',
          'Docker Networking and Storage',
          'Docker Compose for Multi-container Apps',
          'Container Security Best Practices'
        ]
      },
      {
        id: 'orchestration',
        title: 'Container Orchestration',
        duration: '4 weeks',
        topics: [
          'Kubernetes Architecture and Components',
          'Deploying Applications on Kubernetes',
          'Kubernetes Networking and Storage',
          'Helm Charts for Package Management',
          'Kubernetes Security and RBAC'
        ]
      },
      {
        id: 'infrastructure-code',
        title: 'Infrastructure as Code',
        duration: '3 weeks',
        topics: [
          'Infrastructure as Code Principles',
          'Terraform for Infrastructure Provisioning',
          'Ansible for Configuration Management',
          'CloudFormation for AWS Resources',
          'State Management and Best Practices'
        ]
      },
      {
        id: 'monitoring-logging',
        title: 'Monitoring & Observability',
        duration: '2 weeks',
        topics: [
          'Monitoring Strategy and Metrics',
          'Prometheus for Metrics Collection',
          'Grafana for Visualization',
          'ELK Stack for Log Management',
          'Alerting and Incident Response'
        ]
      }
    ]
  },
  {
    id: 'cybersecurity-zero-to-hero',
    title: 'Cyber Security Zero to Hero',
    description: 'Comprehensive cybersecurity training covering ethical hacking, penetration testing, security operations, and incident response to become a certified cybersecurity professional.',
    duration: '14-18 weeks',
    level: 'Beginner to Advanced',
    image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Cybersecurity Fundamentals & Risk Assessment',
      'Ethical Hacking & Penetration Testing',
      'Network Security & Vulnerability Assessment',
      'Web Application Security Testing',
      'Security Operations Center (SOC) Operations',
      'Incident Response & Digital Forensics',
      'Compliance Frameworks (ISO 27001, NIST)',
      'Cloud Security Best Practices',
      'Hands-on Labs with Real-world Scenarios',
      'Industry Certification Preparation (CEH, CISSP)'
    ],
    price: 400,
    is_free: false,
    modules: [
      {
        id: 'security-fundamentals',
        title: 'Cybersecurity Fundamentals',
        duration: '2 weeks',
        topics: [
          'Introduction to Cybersecurity',
          'CIA Triad and Security Principles',
          'Threat Landscape and Attack Vectors',
          'Risk Assessment and Management',
          'Security Frameworks and Standards'
        ]
      },
      {
        id: 'ethical-hacking',
        title: 'Ethical Hacking Basics',
        duration: '3 weeks',
        topics: [
          'Introduction to Ethical Hacking',
          'Reconnaissance and Information Gathering',
          'Scanning and Enumeration Techniques',
          'Vulnerability Assessment Tools',
          'Social Engineering Techniques'
        ]
      },
      {
        id: 'network-security',
        title: 'Network Security & Testing',
        duration: '3 weeks',
        topics: [
          'Network Security Fundamentals',
          'Firewall and IDS/IPS Configuration',
          'Network Penetration Testing',
          'Wireless Security Assessment',
          'Network Monitoring and Analysis'
        ]
      },
      {
        id: 'web-app-security',
        title: 'Web Application Security',
        duration: '3 weeks',
        topics: [
          'OWASP Top 10 Vulnerabilities',
          'Web Application Penetration Testing',
          'SQL Injection and XSS Attacks',
          'Authentication and Session Management',
          'Secure Code Review Practices'
        ]
      },
      {
        id: 'soc-operations',
        title: 'Security Operations',
        duration: '2 weeks',
        topics: [
          'Security Operations Center (SOC) Setup',
          'SIEM Tools and Log Analysis',
          'Threat Hunting Techniques',
          'Security Incident Detection',
          'Threat Intelligence Integration'
        ]
      },
      {
        id: 'incident-response',
        title: 'Incident Response & Forensics',
        duration: '2 weeks',
        topics: [
          'Incident Response Planning',
          'Digital Forensics Fundamentals',
          'Malware Analysis Basics',
          'Evidence Collection and Preservation',
          'Post-Incident Analysis and Reporting'
        ]
      },
      {
        id: 'compliance-governance',
        title: 'Compliance & Governance',
        duration: '1 week',
        topics: [
          'Regulatory Compliance Requirements',
          'ISO 27001 Implementation',
          'NIST Cybersecurity Framework',
          'GDPR and Privacy Regulations',
          'Security Audit and Assessment'
        ]
      }
    ]
  },
  {
    id: 'azure-fundamentals',
    title: 'Microsoft Azure Fundamentals (AZ-900)',
    description: 'Start your cloud journey with Microsoft Azure fundamentals covering core services, pricing, and support with hands-on labs and certification preparation.',
    duration: '6-8 weeks',
    level: 'Beginner',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Azure Cloud Concepts and Services',
      'Azure Core Solutions and Management Tools',
      'Azure Security, Privacy, and Compliance',
      'Azure Pricing and Support Options',
      'Hands-on Labs with Azure Portal',
      'AZ-900 Certification Preparation',
      'Practice Exams and Study Materials'
    ],
    price: 200,
    is_free: false,
    modules: [
      {
        id: 'azure-concepts',
        title: 'Azure Cloud Concepts',
        duration: '2 weeks',
        topics: [
          'Introduction to Cloud Computing',
          'Azure Global Infrastructure',
          'Azure Services Overview',
          'Azure Resource Manager',
          'Azure Subscriptions and Management Groups'
        ]
      },
      {
        id: 'azure-services',
        title: 'Azure Core Services',
        duration: '2 weeks',
        topics: [
          'Azure Compute Services',
          'Azure Storage Services',
          'Azure Networking Services',
          'Azure Database Services',
          'Azure Identity Services'
        ]
      },
      {
        id: 'azure-security',
        title: 'Azure Security & Compliance',
        duration: '1 week',
        topics: [
          'Azure Security Center',
          'Azure Key Vault',
          'Azure Active Directory',
          'Compliance and Privacy',
          'Azure Governance Features'
        ]
      },
      {
        id: 'azure-pricing',
        title: 'Azure Pricing & Support',
        duration: '1 week',
        topics: [
          'Azure Pricing Models',
          'Cost Management Tools',
          'Azure Support Plans',
          'Service Level Agreements',
          'Azure Advisor Recommendations'
        ]
      }
    ]
  },
  {
    id: 'docker-containerization',
    title: 'Docker Containerization Mastery',
    description: 'Master containerization with Docker from basics to advanced concepts including image creation, networking, orchestration, and production deployment strategies.',
    duration: '6-8 weeks',
    level: 'Beginner to Intermediate',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Docker Architecture and Components',
      'Container Lifecycle Management',
      'Docker Image Creation and Optimization',
      'Docker Networking and Storage',
      'Docker Compose for Multi-container Apps',
      'Container Security Best Practices',
      'Docker in Production Environments',
      'Integration with CI/CD Pipelines'
    ],
    price: 0,
    is_free: true,
    modules: [
      {
        id: 'docker-basics',
        title: 'Docker Fundamentals',
        duration: '2 weeks',
        topics: [
          'Introduction to Containerization',
          'Docker Installation and Setup',
          'Docker Architecture Overview',
          'Basic Docker Commands',
          'Container vs Virtual Machine'
        ]
      },
      {
        id: 'docker-images',
        title: 'Docker Images & Containers',
        duration: '2 weeks',
        topics: [
          'Working with Docker Images',
          'Creating Custom Docker Images',
          'Dockerfile Best Practices',
          'Image Optimization Techniques',
          'Container Lifecycle Management'
        ]
      },
      {
        id: 'docker-networking',
        title: 'Docker Networking & Storage',
        duration: '1 week',
        topics: [
          'Docker Networking Concepts',
          'Container Communication',
          'Docker Volumes and Bind Mounts',
          'Data Persistence Strategies',
          'Network Security Considerations'
        ]
      },
      {
        id: 'docker-compose',
        title: 'Docker Compose & Orchestration',
        duration: '1 week',
        topics: [
          'Introduction to Docker Compose',
          'Multi-container Applications',
          'Service Dependencies',
          'Environment Configuration',
          'Production Deployment with Compose'
        ]
      }
    ]
  },
  {
    id: 'kubernetes-mastery',
    title: 'Kubernetes Container Orchestration',
    description: 'Master Kubernetes container orchestration with comprehensive training on deployment, scaling, networking, security, and production-ready cluster management.',
    duration: '8-10 weeks',
    level: 'Intermediate to Advanced',
    image: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Kubernetes Architecture and Components',
      'Pod, Service, and Deployment Management',
      'ConfigMaps and Secrets Management',
      'Persistent Volumes and Storage Classes',
      'Kubernetes Networking and Ingress',
      'RBAC and Security Best Practices',
      'Monitoring and Logging Solutions',
      'Helm Charts and Package Management',
      'Production Cluster Management',
      'CKA Certification Preparation'
    ],
    price: 350,
    is_free: false,
    modules: [
      {
        id: 'k8s-fundamentals',
        title: 'Kubernetes Fundamentals',
        duration: '2 weeks',
        topics: [
          'Kubernetes Architecture Overview',
          'Master and Worker Node Components',
          'kubectl Command Line Tool',
          'Kubernetes API and Objects',
          'Cluster Setup and Configuration'
        ]
      },
      {
        id: 'k8s-workloads',
        title: 'Kubernetes Workloads',
        duration: '2 weeks',
        topics: [
          'Pods and Pod Lifecycle',
          'Deployments and ReplicaSets',
          'Services and Service Discovery',
          'DaemonSets and StatefulSets',
          'Jobs and CronJobs'
        ]
      },
      {
        id: 'k8s-config',
        title: 'Configuration Management',
        duration: '1 week',
        topics: [
          'ConfigMaps for Configuration Data',
          'Secrets for Sensitive Information',
          'Environment Variables',
          'Volume Mounts and Configuration',
          'Resource Quotas and Limits'
        ]
      },
      {
        id: 'k8s-storage',
        title: 'Storage & Persistence',
        duration: '1 week',
        topics: [
          'Persistent Volumes and Claims',
          'Storage Classes and Provisioners',
          'StatefulSet Storage Requirements',
          'Backup and Restore Strategies',
          'Storage Performance Optimization'
        ]
      },
      {
        id: 'k8s-networking',
        title: 'Networking & Security',
        duration: '1 week',
        topics: [
          'Kubernetes Networking Model',
          'Ingress Controllers and Rules',
          'Network Policies',
          'RBAC and Security Contexts',
          'Pod Security Standards'
        ]
      },
      {
        id: 'k8s-operations',
        title: 'Operations & Monitoring',
        duration: '1 week',
        topics: [
          'Cluster Monitoring with Prometheus',
          'Logging with Fluentd and ELK',
          'Helm Package Manager',
          'Cluster Maintenance and Upgrades',
          'Troubleshooting Common Issues'
        ]
      }
    ]
  }
];