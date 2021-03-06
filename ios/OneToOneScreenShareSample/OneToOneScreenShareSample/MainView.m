//
//  MainView.m
//
//  Copyright © 2016 Tokbox, Inc. All rights reserved.
//

#import "MainView.h"
#import <OTScreenShareKit/OTScreenShareKit.h>
#import <OTAnnotationKit/OTAnnotationKit.h>

@interface MainView()
@property (weak, nonatomic) IBOutlet UIView *publisherView;
@property (weak, nonatomic) IBOutlet UIView *subscriberView;

// 4 action buttons at the bottom of the view
@property (weak, nonatomic) IBOutlet UIButton *publisherVideoButton;
@property (weak, nonatomic) IBOutlet UIButton *callButton;
@property (weak, nonatomic) IBOutlet UIButton *publisherAudioButton;
@property (weak, nonatomic) IBOutlet UIButton *annotationButton;

@property (weak, nonatomic) IBOutlet UIButton *subscriberVideoButton;
@property (weak, nonatomic) IBOutlet UIButton *subscriberAudioButton;

@property (weak, nonatomic) IBOutlet UIButton *publisherCameraButton;

@property (nonatomic) UIImageView *subscriberPlaceHolderImageView;
@property (nonatomic) UIImageView *publisherPlaceHolderImageView;

@property (nonatomic) OTAnnotationScrollView *annotationView;
@property (weak, nonatomic) IBOutlet UIView *actionButtonView;

@property (weak, nonatomic) IBOutlet UIView *screenshareNotificationBar;
@end

@implementation MainView

- (OTAnnotationScrollView *)annotationView {
    if (!_annotationView) {
        _annotationView = [[OTAnnotationScrollView alloc] init];
        _annotationView.backgroundColor = [UIColor darkGrayColor];
        [_annotationView initializeToolbarView];
    }
    return _annotationView;
}


- (UIImageView *)publisherPlaceHolderImageView {
    if (!_publisherPlaceHolderImageView) {
        _publisherPlaceHolderImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"avatar"]];
        _publisherPlaceHolderImageView.backgroundColor = [UIColor clearColor];
        _publisherPlaceHolderImageView.contentMode = UIViewContentModeScaleAspectFit;
        _publisherPlaceHolderImageView.translatesAutoresizingMaskIntoConstraints = NO;
    }
    return _publisherPlaceHolderImageView;
}

- (UIImageView *)subscriberPlaceHolderImageView {
    if (!_subscriberPlaceHolderImageView) {
        _subscriberPlaceHolderImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"avatar"]];
        _subscriberPlaceHolderImageView.backgroundColor = [UIColor clearColor];
        _subscriberPlaceHolderImageView.contentMode = UIViewContentModeScaleAspectFit;
        _subscriberPlaceHolderImageView.translatesAutoresizingMaskIntoConstraints = NO;
    }
    return _subscriberPlaceHolderImageView;
}

- (void)awakeFromNib {
    [super awakeFromNib];
    self.shareView.hidden = YES;
    self.publisherView.hidden = YES;
    self.publisherView.alpha = 1;
    self.publisherView.layer.borderWidth = 1;
    self.publisherView.layer.borderColor = [UIColor whiteColor].CGColor;
    self.publisherView.layer.backgroundColor = [UIColor grayColor].CGColor;
    self.publisherView.layer.cornerRadius = 3;
    [self showSubscriberControls:NO];
}

- (void)layoutSubviews {
    [super layoutSubviews];
    
    [self drawBorderOn:self.publisherAudioButton withWhiteBorder:YES];
    [self drawBorderOn:self.callButton withWhiteBorder:NO];
    [self drawBorderOn:self.publisherVideoButton withWhiteBorder:YES];
    [self drawBorderOn:self.screenShareHolder withWhiteBorder:YES];
    [self drawBorderOn:self.annotationButton withWhiteBorder:YES];
}

- (void)drawBorderOn:(UIView *)view
     withWhiteBorder:(BOOL)withWhiteBorder {
    
    view.layer.cornerRadius = (view.bounds.size.width / 2);
    if (withWhiteBorder) {
        view.layer.borderWidth = 1;
        view.layer.borderColor = [UIColor whiteColor].CGColor;
    }
}

#pragma mark - publisher view
- (void)addPublisherView:(UIView *)publisherView {
    
    [self.publisherView setHidden:NO];
    publisherView.frame = CGRectMake(0, 0, CGRectGetWidth(self.publisherView.bounds), CGRectGetHeight(self.publisherView.bounds));
    [self.publisherView addSubview:publisherView];
    publisherView.translatesAutoresizingMaskIntoConstraints = NO;
    [self addAttachedLayoutConstantsToSuperview:publisherView];
}

- (void)removePublisherView {
    [self.publisherView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
}

- (void)addPlaceHolderToPublisherView {
    self.publisherPlaceHolderImageView.frame = CGRectMake(0, 0, CGRectGetWidth(self.publisherView.bounds), CGRectGetHeight(self.publisherView.bounds));
    [self.publisherView addSubview:self.publisherPlaceHolderImageView];
    [self addAttachedLayoutConstantsToSuperview:self.publisherPlaceHolderImageView];
}

- (void)connectCallHolder:(BOOL)connected {
    if (connected) {
        [self.callButton setImage:[UIImage imageNamed:@"hangUp"] forState:UIControlStateNormal];
        self.callButton.layer.backgroundColor = [UIColor colorWithRed:(205/255.0) green:(32/255.0) blue:(40/255.0) alpha:1.0].CGColor;
    }
    else {
        [self.callButton setImage:[UIImage imageNamed:@"startCall"] forState:UIControlStateNormal];
        self.callButton.layer.backgroundColor = [UIColor colorWithRed:(106/255.0) green:(173/255.0) blue:(191/255.0) alpha:1.0].CGColor;
    }
}
- (void)mutePubliserhMic:(BOOL)muted {
    if (muted) {
        [self.publisherAudioButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    }
    else {
        [self.publisherAudioButton setImage:[UIImage imageNamed:@"mutedMic"] forState: UIControlStateNormal];
    }
}

- (void)connectPubliserVideo:(BOOL)connected {
    if (connected) {
        [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
    }
    else {
        [self.publisherVideoButton setImage:[UIImage imageNamed:@"noVideo"] forState:UIControlStateNormal];
    }
}

#pragma mark - subscriber view
- (void)addSubscribeView:(UIView *)subsciberView {
    
    subsciberView.frame = CGRectMake(0, 0, CGRectGetWidth(self.subscriberView.bounds), CGRectGetHeight(self.subscriberView.bounds));
    [self.subscriberView addSubview:subsciberView];
    subsciberView.translatesAutoresizingMaskIntoConstraints = NO;
    [self addAttachedLayoutConstantsToSuperview:subsciberView];
}

- (void)removeSubscriberView {
    [self.subscriberView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
}

- (void)addPlaceHolderToSubscriberView {
    self.subscriberPlaceHolderImageView.frame = self.subscriberView.bounds;
    [self.subscriberView addSubview:self.subscriberPlaceHolderImageView];
    [self addAttachedLayoutConstantsToSuperview:self.subscriberPlaceHolderImageView];
}

- (void)muteSubscriberMic:(BOOL)muted {
    if (muted) {
        [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    }
    else {
        [self.subscriberAudioButton setImage:[UIImage imageNamed:@"noAudio"] forState: UIControlStateNormal];
    }
}

- (void)connectSubsciberVideo:(BOOL)connected {
    if (connected) {
        [self.subscriberVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
    }
    else {
        [self.subscriberVideoButton setImage:[UIImage imageNamed:@"noVideo"] forState: UIControlStateNormal];
    }
}

- (void)showSubscriberControls:(BOOL)shown {
    if (shown) {
        [self.subscriberAudioButton setHidden:NO];
        [self.subscriberVideoButton setHidden:NO];
    }
    else {
        [self.subscriberAudioButton setHidden:YES];
        [self.subscriberVideoButton setHidden:YES];
    }
}

- (void)addScreenShareViewWithContentView:(UIView *)view {
    self.annotationView.frame = self.shareView.bounds;
    [self.annotationView addContentView:view];
    [self.shareView setHidden:NO];
    [self.shareView addSubview:self.annotationView];
    [self.publisherView setHidden:YES];
    [self bringSubviewToFront:self.actionButtonView];
}

- (void)removeScreenShareView {
    [self.shareView setHidden:YES];
    [self.annotationView removeFromSuperview];
    [self.publisherView setHidden:NO];
}

#pragma mark - annotation bar
- (void)toggleAnnotationToolBar {
    
    if (!self.annotationView.toolbarView || !self.annotationView.toolbarView.superview) {
        
        CGFloat toolbarViewHeight = self.annotationView.toolbarView.bounds.size.height;
        self.annotationView.toolbarView.frame = CGRectMake(0,
                                                           CGRectGetHeight(self.annotationView.bounds) - toolbarViewHeight + 20,
                                                           self.annotationView.toolbarView.bounds.size.width,
                                                           toolbarViewHeight);
        [self addSubview:self.annotationView.toolbarView];
    }
    else {
        [self removeAnnotationToolBar];
    }
}

- (void)removeAnnotationToolBar {
    [self.annotationView.toolbarView removeFromSuperview];
}

- (void)cleanCanvas {
    [self.annotationView eraseAll];
}

#pragma mark - other controls
- (void)removePlaceHolderImage {
    [self.publisherPlaceHolderImageView removeFromSuperview];
    [self.subscriberPlaceHolderImageView removeFromSuperview];
}

- (void)updateControlButtonsForCall {
    [self.subscriberVideoButton setEnabled:YES];
    [self.subscriberAudioButton setEnabled:YES];
    [self.publisherCameraButton setEnabled:YES];
    [self.publisherVideoButton setEnabled:YES];
    [self.publisherAudioButton setEnabled:YES];
    [self.screenShareHolder setEnabled:YES];
    [self.annotationButton setEnabled:NO];
    [self.publisherAudioButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState:UIControlStateNormal];
    [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    [self.subscriberVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
}

- (void)updateControlButtonsForScreenShare {
    [self.subscriberVideoButton setEnabled:NO];
    [self.subscriberAudioButton setEnabled:YES];
    [self.publisherCameraButton setEnabled:NO];
    [self.publisherVideoButton setEnabled:NO];
    [self.publisherAudioButton setEnabled:YES];
    [self.screenShareHolder setEnabled:YES];
    [self.annotationButton setEnabled:YES];
    [self.publisherAudioButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState:UIControlStateNormal];
    [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    [self.subscriberVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
}


- (void)updateControlButtonsForEndingCall {
    [self.subscriberVideoButton setEnabled:NO];
    [self.subscriberAudioButton setEnabled:NO];
    [self.publisherCameraButton setEnabled:NO];
    [self.publisherVideoButton setEnabled:NO];
    [self.publisherAudioButton setEnabled:NO];
    [self.screenShareHolder setEnabled:NO];
    [self.annotationButton setEnabled:NO];
    [self.publisherAudioButton setImage:[UIImage imageNamed:@"mic"] forState: UIControlStateNormal];
    [self.publisherVideoButton setImage:[UIImage imageNamed:@"video"] forState:UIControlStateNormal];
    [self.subscriberAudioButton setImage:[UIImage imageNamed:@"audio"] forState: UIControlStateNormal];
    [self.subscriberVideoButton setImage:[UIImage imageNamed:@"video"] forState: UIControlStateNormal];
}

- (void)showScreenShareNotificationBar:(BOOL)shown {
    [self.screenshareNotificationBar setHidden:!shown];
}

- (void)showReverseCameraButton; {
    self.publisherCameraButton.hidden = NO;
}

#pragma mark - private method
-(void)addAttachedLayoutConstantsToSuperview:(UIView *)view {
    
    if (!view.superview) {
        return;
    }
    
    NSLayoutConstraint *top = [NSLayoutConstraint constraintWithItem:view
                                                           attribute:NSLayoutAttributeTop
                                                           relatedBy:NSLayoutRelationEqual
                                                              toItem:view.superview
                                                           attribute:NSLayoutAttributeTop
                                                          multiplier:1.0
                                                            constant:0.0];
    NSLayoutConstraint *leading = [NSLayoutConstraint constraintWithItem:view
                                                               attribute:NSLayoutAttributeLeading
                                                               relatedBy:NSLayoutRelationEqual
                                                                  toItem:view.superview
                                                               attribute:NSLayoutAttributeLeading
                                                              multiplier:1.0
                                                                constant:0.0];
    NSLayoutConstraint *trailing = [NSLayoutConstraint constraintWithItem:view
                                                                attribute:NSLayoutAttributeTrailing
                                                                relatedBy:NSLayoutRelationEqual
                                                                   toItem:view.superview
                                                                attribute:NSLayoutAttributeTrailing
                                                               multiplier:1.0
                                                                 constant:0.0];
    NSLayoutConstraint *bottom = [NSLayoutConstraint constraintWithItem:view
                                                              attribute:NSLayoutAttributeBottom
                                                              relatedBy:NSLayoutRelationEqual
                                                                 toItem:view.superview
                                                              attribute:NSLayoutAttributeBottom
                                                             multiplier:1.0
                                                               constant:0.0];
    [NSLayoutConstraint activateConstraints:@[top, leading, trailing, bottom]];
}


@end
