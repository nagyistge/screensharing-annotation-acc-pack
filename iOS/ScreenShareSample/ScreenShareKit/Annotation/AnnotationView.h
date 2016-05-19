//
//  AnnotationView.h
//  ScreenShareSample
//
//  Created by Xi Huang on 5/18/16.
//  Copyright © 2016 Lucas Huang. All rights reserved.
//

#import <ScreenShareKit/Annotatable.h>
#import <ScreenShareKit/AnnotationPath.h>
#import <ScreenShareKit/AnnotationTextField.h>

@interface AnnotationView : UIView

- (instancetype)initWithFrame:(CGRect)frame;

- (void)setCurrentDrawPath:(AnnotationPath *)drawingPath;

- (void)addAnnotatable:(id<Annotatable>)annotatable;

@end