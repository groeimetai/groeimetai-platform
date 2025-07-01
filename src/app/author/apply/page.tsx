'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { createAuthor } from '@/services/authorService';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { 
  User, 
  Briefcase, 
  Globe, 
  Linkedin, 
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface ApplicationFormData {
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  linkedIn: string;
  website: string;
  experience: string;
  sampleWork: string;
  whyTeach: string;
  agreedToTerms: boolean;
}

export default function AuthorApplyPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: userProfile?.displayName || '',
    email: userProfile?.email || user?.email || '',
    bio: '',
    expertise: [],
    linkedIn: '',
    website: '',
    experience: '',
    sampleWork: '',
    whyTeach: '',
    agreedToTerms: false
  });

  const [expertiseInput, setExpertiseInput] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.bio.trim() || formData.bio.length < 100) {
      newErrors.bio = 'Bio must be at least 100 characters';
    }
    if (formData.expertise.length === 0) {
      newErrors.expertise = 'At least one area of expertise is required';
    }
    if (!formData.experience.trim() || formData.experience.length < 100) {
      newErrors.experience = 'Experience must be at least 100 characters';
    }
    if (!formData.whyTeach.trim() || formData.whyTeach.length < 50) {
      newErrors.whyTeach = 'This field must be at least 50 characters';
    }
    if (!formData.agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create author profile
      const authorData = {
        userId: user.uid,
        name: formData.name,
        bio: formData.bio,
        email: formData.email,
        expertise: formData.expertise,
        linkedIn: formData.linkedIn,
        website: formData.website,
        revenueSharePercentage: 70, // Default 70% for author, 30% for platform
        avatar: userProfile?.photoURL
      };

      await createAuthor(authorData);

      // Update user role to instructor
      await updateUserProfile(user.uid, { role: 'instructor' });

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/author/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise.includes(expertiseInput.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()]
      });
      setExpertiseInput('');
    }
  };

  const removeExpertise = (skill: string) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter(s => s !== skill)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (success) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardContent className="pt-16 pb-16 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your instructor application has been approved. Redirecting to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Become an Instructor</CardTitle>
          <CardDescription>
            Share your knowledge and earn money by creating courses on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself, your background, and what makes you qualified to teach..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.bio.length}/100 characters (minimum)
                </p>
                {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise *</Label>
                <div className="flex gap-2">
                  <Input
                    id="expertise"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    placeholder="e.g., Web Development, AI, Marketing"
                  />
                  <Button type="button" onClick={addExpertise}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeExpertise(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {errors.expertise && <p className="text-sm text-red-500">{errors.expertise}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedIn"
                      value={formData.linkedIn}
                      onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                      className="pl-10"
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="pl-10"
                      placeholder="https://johndoe.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Teaching Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Teaching Experience</h3>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Relevant Experience *</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Describe your professional experience, teaching experience, certifications, or any relevant background..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.experience.length}/100 characters (minimum)
                </p>
                {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampleWork">Sample Work or Portfolio (Optional)</Label>
                <Textarea
                  id="sampleWork"
                  value={formData.sampleWork}
                  onChange={(e) => setFormData({ ...formData, sampleWork: e.target.value })}
                  placeholder="Share links to your previous work, courses, articles, or any content that demonstrates your expertise..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whyTeach">Why do you want to teach on our platform? *</Label>
                <Textarea
                  id="whyTeach"
                  value={formData.whyTeach}
                  onChange={(e) => setFormData({ ...formData, whyTeach: e.target.value })}
                  placeholder="Tell us about your motivation to teach and what unique value you can bring to our students..."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.whyTeach.length}/50 characters (minimum)
                </p>
                {errors.whyTeach && <p className="text-sm text-red-500">{errors.whyTeach}</p>}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: checked as boolean })}
                />
                <div>
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                    I agree to the instructor terms and conditions, including the revenue sharing model (70% instructor, 30% platform)
                  </Label>
                </div>
              </div>
              {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
            </div>

            {/* Submit */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}