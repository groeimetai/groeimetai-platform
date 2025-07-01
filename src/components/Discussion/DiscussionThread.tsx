'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Code2, 
  Award,
  Bell,
  BellOff,
  Reply,
  MoreVertical,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  codeSnippet?: string;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  isExpert?: boolean;
  replies?: Comment[];
  parentId?: string;
}

interface DiscussionThreadProps {
  lessonId: string;
  lessonTitle: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  isExpert?: boolean;
}

export function DiscussionThread({
  lessonId,
  lessonTitle,
  currentUserId,
  currentUserName = 'Anonymous',
  currentUserAvatar,
  isExpert = false
}: DiscussionThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  // Mock data for demo
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Alice Developer',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        content: 'Great lesson! I had some trouble understanding the async/await pattern in the third example. Could someone explain it in simpler terms?',
        createdAt: new Date(Date.now() - 3600000),
        upvotes: 5,
        downvotes: 0,
        isExpert: false,
        replies: [
          {
            id: '2',
            userId: 'user2',
            userName: 'Bob Expert',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
            content: 'Sure! Think of async/await as a way to write asynchronous code that looks synchronous. When you use await, it pauses the function execution until the promise resolves.',
            codeSnippet: `// Instead of this:
fetchData().then(data => {
  console.log(data);
});

// You can write:
const data = await fetchData();
console.log(data);`,
            createdAt: new Date(Date.now() - 1800000),
            upvotes: 12,
            downvotes: 0,
            isExpert: true,
            parentId: '1'
          }
        ]
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Charlie Learner',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        content: 'Has anyone tried implementing the bonus challenge? I\'m stuck on the error handling part.',
        createdAt: new Date(Date.now() - 7200000),
        upvotes: 3,
        downvotes: 0,
        isExpert: false
      }
    ];
    setComments(mockComments);
  }, [lessonId]);

  const handleSubmitComment = () => {
    if (!newComment.trim() && !codeSnippet.trim()) return;
    if (!currentUserId) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to post comments.',
        variant: 'destructive'
      });
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      content: newComment,
      codeSnippet: codeSnippet || undefined,
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      isExpert,
      parentId: replyingTo || undefined
    };

    if (replyingTo) {
      // Add as reply
      setComments(prev => prev.map(c => {
        if (c.id === replyingTo) {
          return {
            ...c,
            replies: [...(c.replies || []), comment]
          };
        }
        return c;
      }));
    } else {
      // Add as top-level comment
      setComments(prev => [comment, ...prev]);
    }

    // Reset form
    setNewComment('');
    setCodeSnippet('');
    setShowCodeEditor(false);
    setReplyingTo(null);

    // Show notification
    if (notifications) {
      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added to the discussion.',
      });
    }
  };

  const handleVote = (commentId: string, voteType: 'up' | 'down') => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const currentVote = comment.userVote;
        let upvotes = comment.upvotes;
        let downvotes = comment.downvotes;
        let newVote: 'up' | 'down' | null = voteType;

        // Remove previous vote
        if (currentVote === 'up') upvotes--;
        if (currentVote === 'down') downvotes--;

        // Add new vote or remove if same
        if (currentVote === voteType) {
          newVote = null;
        } else {
          if (voteType === 'up') upvotes++;
          if (voteType === 'down') downvotes++;
        }

        return { ...comment, upvotes, downvotes, userVote: newVote };
      }
      return comment;
    }));
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12' : ''} mb-4`}
    >
      <Card className={`${isReply ? 'border-l-4 border-l-blue-500' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={comment.userAvatar} />
              <AvatarFallback>{comment.userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{comment.userName}</h4>
                  {comment.isExpert && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Expert
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(comment.createdAt)} ago
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <p className="text-sm mb-3">{comment.content}</p>
              
              {comment.codeSnippet && (
                <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <CodeMirror
                    value={comment.codeSnippet}
                    height="auto"
                    theme={oneDark}
                    extensions={[javascript()]}
                    editable={false}
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: false,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: false,
                      bracketMatching: true,
                      closeBrackets: false,
                      autocompletion: false,
                      rectangularSelection: false,
                      highlightSelectionMatches: false,
                      searchKeymap: false,
                    }}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(comment.id, 'up')}
                    className={comment.userVote === 'up' ? 'text-green-600' : ''}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {comment.upvotes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(comment.id, 'down')}
                    className={comment.userVote === 'down' ? 'text-red-600' : ''}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {comment.downvotes}
                  </Button>
                </div>
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Discussion: {lessonTitle}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {replyingTo && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Replying to comment...
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                    className="ml-2"
                  >
                    Cancel
                  </Button>
                </p>
              </div>
            )}
            
            <Textarea
              placeholder="Share your thoughts or ask a question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            
            {showCodeEditor && (
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <CodeMirror
                  value={codeSnippet}
                  onChange={setCodeSnippet}
                  height="200px"
                  theme={oneDark}
                  extensions={[javascript()]}
                  placeholder="// Add your code snippet here"
                />
              </div>
            )}
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCodeEditor(!showCodeEditor)}
              >
                <Code2 className="w-4 h-4 mr-1" />
                {showCodeEditor ? 'Hide' : 'Add'} Code
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() && !codeSnippet.trim()}
              >
                Post Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {comments.map(comment => renderComment(comment))}
      </AnimatePresence>
      
      {comments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No comments yet. Be the first to start the discussion!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}