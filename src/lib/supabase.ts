import { createClient } from '@supabase/supabase-js';
import { trainersData } from '../data/trainers.js';

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const trainers = trainersData;

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
  originalPrice?: number;
  is_free: boolean;
  schedule?: string;
  timing?: string;
  youtubePlaylist?: string;
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
    price: 48000, // PKR equivalent
    originalPrice: 60000,
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
    price: 60000, // PKR equivalent
    originalPrice: 75000,
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
    price: 100000, // PKR equivalent
    originalPrice: 120000,
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
    price: 40000, // PKR equivalent
    originalPrice: 50000,
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
    price: 8750, // PKR equivalent
    originalPrice: 10500,
    is_free: false,
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
    price: 8750, // PKR equivalent
    originalPrice: 10500,
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
  },
  // New Courses
  {
    id: 'ansible-training',
    title: 'Be an Ansible Expert',
    description: 'Professional training on Ansible from basics to advanced level. Ansible is an open-source software provisioning, configuration management, and application-deployment tool enabling infrastructure as code.',
    duration: '6 Sessions (2 sessions per week)',
    level: 'Beginner to Advanced',
    image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Ansible fundamentals and architecture',
      'Playbooks and inventory management',
      'Roles and modules development',
      'Configuration management best practices',
      'Integration with Jenkins and CI/CD',
      'Ansible Vault for secrets management',
      'Advanced automation techniques',
      'Troubleshooting and debugging',
      'Real-world project implementation',
      'Best practices and optimization'
    ],
    price: 8000,
    originalPrice: 10000,
    is_free: false,
    schedule: 'Every Saturday & Sunday',
    timing: '12:30 PM - 02:30 PM',
    modules: [
      {
        id: 'ansible-basics',
        title: 'Ansible Fundamentals',
        duration: '2 sessions',
        topics: [
          'Introduction to Ansible and Infrastructure as Code',
          'Ansible architecture and components',
          'Installation and initial setup',
          'Inventory management and host patterns',
          'Basic ad-hoc commands'
        ]
      },
      {
        id: 'ansible-playbooks',
        title: 'Playbooks and Configuration',
        duration: '2 sessions',
        topics: [
          'Writing and structuring playbooks',
          'Variables and facts management',
          'Conditionals and loops',
          'Handlers and notifications',
          'Template management with Jinja2'
        ]
      },
      {
        id: 'ansible-advanced',
        title: 'Advanced Ansible Features',
        duration: '2 sessions',
        topics: [
          'Roles development and Galaxy',
          'Ansible Vault for security',
          'Custom modules and plugins',
          'Integration with CI/CD pipelines',
          'Performance optimization and best practices'
        ]
      }
    ]
  },
  {
    id: 'jenkins-training',
    title: 'Be a Jenkins Expert',
    description: 'Your roadmap to become a Jenkins expert - Jenkins from basics to advanced level. Master build automation, CI/CD pipelines, and deployment strategies.',
    duration: '6 Sessions (2 sessions per week)',
    level: 'Beginner to Advanced',
    image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Jenkins installation and configuration',
      'Build automation and CI/CD pipelines',
      'Plugin management and ecosystem',
      'Integration with version control systems',
      'Deployment strategies and best practices',
      'Jenkins security and user management',
      'Pipeline as Code with Jenkinsfile',
      'Distributed builds and scaling',
      'Monitoring and troubleshooting',
      'Integration with Docker and Kubernetes'
    ],
    price: 9600,
    originalPrice: 12000,
    is_free: false,
    schedule: 'Flexible timing',
    timing: 'To be arranged',
    modules: [
      {
        id: 'jenkins-basics',
        title: 'Jenkins Fundamentals',
        duration: '2 sessions',
        topics: [
          'Introduction to Jenkins and CI/CD concepts',
          'Jenkins installation and initial setup',
          'Understanding Jenkins architecture',
          'Basic job creation and configuration',
          'Build triggers and scheduling'
        ]
      },
      {
        id: 'jenkins-pipelines',
        title: 'Pipeline Development',
        duration: '2 sessions',
        topics: [
          'Freestyle vs Pipeline jobs',
          'Declarative and Scripted pipelines',
          'Pipeline syntax and best practices',
          'Multi-branch pipelines',
          'Pipeline libraries and shared code'
        ]
      },
      {
        id: 'jenkins-advanced',
        title: 'Advanced Jenkins Features',
        duration: '2 sessions',
        topics: [
          'Plugin development and management',
          'Jenkins security and RBAC',
          'Distributed builds and agents',
          'Integration with external tools',
          'Monitoring, logging, and troubleshooting'
        ]
      }
    ]
  },
  {
    id: 'voip-training',
    title: 'Open Source VoIP Training',
    description: 'Comprehensive training on Open Source VoIP technologies and implementation. Learn to build and manage VoIP systems using open-source solutions.',
    duration: 'Self-paced',
    level: 'Beginner to Intermediate',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'VoIP fundamentals and protocols',
      'Open source VoIP solutions overview',
      'Asterisk PBX configuration and management',
      'SIP protocol implementation',
      'VoIP security considerations',
      'Quality of Service (QoS) optimization',
      'Troubleshooting and optimization techniques',
      'Integration with existing systems',
      'Cost-effective VoIP deployment',
      'Real-world implementation scenarios'
    ],
    price: 0,
    originalPrice: 0,
    is_free: true,
    youtubePlaylist: 'https://youtube.com/playlist?list=PLe-5mmZeZbmhFG8u8rHkcFUKr0PEmimY3&si=TstGNcDleFfNh_17',
    modules: [
      {
        id: 'voip-basics',
        title: 'VoIP Fundamentals',
        duration: 'Self-paced',
        topics: [
          'Introduction to Voice over IP',
          'VoIP vs traditional telephony',
          'VoIP protocols (SIP, RTP, RTCP)',
          'Network requirements for VoIP',
          'Quality of Service basics'
        ]
      },
      {
        id: 'asterisk-pbx',
        title: 'Asterisk PBX Configuration',
        duration: 'Self-paced',
        topics: [
          'Asterisk installation and setup',
          'Configuration files and structure',
          'Extension and dialplan configuration',
          'Trunk configuration and routing',
          'Voicemail and call features'
        ]
      },
      {
        id: 'voip-security',
        title: 'VoIP Security and Optimization',
        duration: 'Self-paced',
        topics: [
          'VoIP security threats and mitigation',
          'Firewall configuration for VoIP',
          'Performance monitoring and optimization',
          'Troubleshooting common issues',
          'Best practices for production deployment'
        ]
      }
    ]
  },
  {
    id: 'cyber-security-professional',
    title: 'Cyber Security Professional',
    description: 'Comprehensive cybersecurity training from basics to mid-level expertise. Master the essential skills needed to protect organizations from cyber threats.',
    duration: '8 Sessions (2 sessions per week)',
    level: 'Beginner to Intermediate',
    image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Cybersecurity fundamentals and threat landscape',
      'Network security and vulnerability assessment',
      'Ethical hacking and penetration testing',
      'Incident response and digital forensics',
      'Security compliance and governance',
      'Application and web security testing',
      'Cloud security architecture',
      'Advanced threat hunting techniques',
      'Security automation and tools',
      'Industry certifications preparation'
    ],
    price: 100000,
    originalPrice: 120000,
    is_free: false,
    modules: [
      {
        id: 'cybersec-intro',
        title: 'Introduction to Cybersecurity',
        duration: '1 session',
        topics: [
          'Cybersecurity fundamentals',
          'Threat landscape overview',
          'Security principles and frameworks',
          'Risk assessment basics',
          'Compliance requirements'
        ]
      },
      {
        id: 'network-security',
        title: 'Network Security',
        duration: '1 session',
        topics: [
          'Network protocols and vulnerabilities',
          'Firewalls and IDS/IPS systems',
          'VPN technologies and implementation',
          'Network monitoring and analysis',
          'Wireless security considerations'
        ]
      },
      {
        id: 'ethical-hacking',
        title: 'Ethical Hacking and Penetration Testing',
        duration: '1 session',
        topics: [
          'Reconnaissance and scanning techniques',
          'Vulnerability assessment tools',
          'Exploitation methodologies',
          'Post-exploitation techniques',
          'Reporting and remediation'
        ]
      },
      {
        id: 'incident-response',
        title: 'Incident Response and Forensics',
        duration: '1 session',
        topics: [
          'Incident response procedures',
          'Digital forensics techniques',
          'Evidence collection and analysis',
          'Malware analysis basics',
          'Recovery and lessons learned'
        ]
      },
      {
        id: 'compliance-governance',
        title: 'Security Compliance and Governance',
        duration: '1 session',
        topics: [
          'Risk assessment and management',
          'Compliance frameworks (ISO 27001, NIST)',
          'Security policies and procedures',
          'Audit and assessment processes',
          'Business continuity planning'
        ]
      },
      {
        id: 'app-security',
        title: 'Application Security',
        duration: '1 session',
        topics: [
          'Secure coding practices',
          'Web application security testing',
          'Mobile application security',
          'API security considerations',
          'DevSecOps integration'
        ]
      },
      {
        id: 'cloud-security',
        title: 'Cloud Security',
        duration: '1 session',
        topics: [
          'Cloud security architecture',
          'AWS/Azure security services',
          'Container security',
          'Identity and access management',
          'Cloud compliance and governance'
        ]
      },
      {
        id: 'advanced-topics',
        title: 'Advanced Topics',
        duration: '1 session',
        topics: [
          'Threat hunting techniques',
          'Security automation',
          'Emerging threats and trends',
          'Career development in cybersecurity',
          'Continuous learning and certification paths'
        ]
      }
    ]
  },
  {
    id: 'ai-generalist-expert',
    title: 'AI Generalist Expert',
    description: 'Comprehensive AI training covering machine learning, deep learning, and practical AI implementation. Master the skills needed to become an AI professional.',
    duration: '10 Sessions (2 sessions per week)',
    level: 'Beginner to Advanced',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'AI fundamentals and machine learning basics',
      'Python programming for AI development',
      'Deep learning and neural networks',
      'Computer vision and image processing',
      'Natural language processing techniques',
      'Generative AI and large language models',
      'AI model deployment and MLOps',
      'AI in business applications',
      'Advanced AI topics and research trends',
      'Hands-on projects and portfolio development'
    ],
    price: 100000,
    originalPrice: 120000,
    is_free: false,
    modules: [
      {
        id: 'ai-fundamentals',
        title: 'AI Fundamentals',
        duration: '1 session',
        topics: [
          'Introduction to Artificial Intelligence',
          'Types of AI and machine learning',
          'AI ethics and responsible AI',
          'AI applications across industries',
          'Setting up development environment'
        ]
      },
      {
        id: 'python-for-ai',
        title: 'Python for AI',
        duration: '1 session',
        topics: [
          'Python programming essentials',
          'Data structures and libraries',
          'NumPy, Pandas, and Matplotlib',
          'Jupyter notebooks and development workflow',
          'Data manipulation and visualization'
        ]
      },
      {
        id: 'ml-basics',
        title: 'Machine Learning Basics',
        duration: '1 session',
        topics: [
          'Supervised and unsupervised learning',
          'Feature engineering and selection',
          'Model evaluation and validation',
          'Cross-validation and hyperparameter tuning',
          'Common algorithms and their applications'
        ]
      },
      {
        id: 'deep-learning',
        title: 'Deep Learning Fundamentals',
        duration: '1 session',
        topics: [
          'Neural networks architecture',
          'Backpropagation and optimization',
          'TensorFlow and PyTorch basics',
          'Training deep neural networks',
          'Regularization and optimization techniques'
        ]
      },
      {
        id: 'computer-vision',
        title: 'Computer Vision',
        duration: '1 session',
        topics: [
          'Image processing techniques',
          'Convolutional Neural Networks',
          'Object detection and recognition',
          'Image classification projects',
          'Advanced computer vision applications'
        ]
      },
      {
        id: 'nlp',
        title: 'Natural Language Processing',
        duration: '1 session',
        topics: [
          'Text preprocessing and tokenization',
          'Sentiment analysis and classification',
          'Language models and transformers',
          'Named entity recognition',
          'Text generation and summarization'
        ]
      },
      {
        id: 'generative-ai',
        title: 'Generative AI and Large Language Models',
        duration: '1 session',
        topics: [
          'Introduction to GPT and transformer models',
          'Prompt engineering techniques',
          'Fine-tuning and custom model development',
          'Working with APIs and pre-trained models',
          'Building AI-powered applications'
        ]
      },
      {
        id: 'ai-deployment',
        title: 'AI Model Deployment',
        duration: '1 session',
        topics: [
          'Model serving and APIs',
          'Cloud deployment strategies',
          'MLOps and model monitoring',
          'Containerization for AI models',
          'Scaling and performance optimization'
        ]
      },
      {
        id: 'ai-business',
        title: 'AI in Business Applications',
        duration: '1 session',
        topics: [
          'AI strategy and implementation',
          'ROI measurement and business cases',
          'Industry-specific AI applications',
          'Change management for AI adoption',
          'Building AI teams and capabilities'
        ]
      },
      {
        id: 'advanced-ai',
        title: 'Advanced AI Topics',
        duration: '1 session',
        topics: [
          'Reinforcement learning',
          'AI research trends',
          'Future of AI and emerging technologies',
          'Career paths in AI',
          'Continuous learning and development'
        ]
      },
      {
        id: 'ai-projects',
        title: 'Capstone Projects',
        duration: 'Throughout course',
        topics: [
          'End-to-end AI project development',
          'Portfolio building and presentation',
          'Code review and best practices',
          'Project deployment and documentation',
          'Career guidance and next steps'
        ]
      }
    ]
  },
  // Additional courses for proper mapping
  {
    id: 'linux-deep-dive',
    title: 'Linux Deep Dive',
    description: 'Comprehensive Linux system administration training covering everything from basics to advanced server management and automation.',
    duration: '8-10 weeks',
    level: 'Beginner to Advanced',
    image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: [
      'Linux fundamentals and command line mastery',
      'System administration and user management',
      'File systems and storage management',
      'Network configuration and security',
      'Shell scripting and automation',
      'Process management and monitoring',
      'Package management and software installation',
      'System performance tuning',
      'Backup and recovery strategies',
      'Enterprise Linux deployment'
    ],
    price: 27000,
    originalPrice: 35000,
    is_free: false,
    modules: [
      {
        id: 'linux-basics',
        title: 'Linux Fundamentals',
        duration: '2 weeks',
        topics: [
          'Linux history and distributions',
          'Command line interface basics',
          'File system navigation',
          'Basic commands and utilities',
          'Text editors and file manipulation'
        ]
      },
      {
        id: 'system-admin',
        title: 'System Administration',
        duration: '3 weeks',
        topics: [
          'User and group management',
          'File permissions and ownership',
          'Process management',
          'System monitoring and logging',
          'Service management with systemd'
        ]
      },
      {
        id: 'networking-security',
        title: 'Networking and Security',
        duration: '2 weeks',
        topics: [
          'Network configuration',
          'Firewall setup and management',
          'SSH configuration and security',
          'System hardening techniques',
          'Security monitoring and auditing'
        ]
      },
      {
        id: 'automation-scripting',
        title: 'Automation and Scripting',
        duration: '2 weeks',
        topics: [
          'Shell scripting fundamentals',
          'Automation with cron jobs',
          'System backup strategies',
          'Performance monitoring scripts',
          'Advanced scripting techniques'
        ]
      }
    ]
  }
];
